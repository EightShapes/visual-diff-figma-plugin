import { Mendelsohn } from "./figmaClasses/Mendelsohn";
import { TestGroup } from "./figmaClasses/TestGroup";

const mendelsohn = new Mendelsohn();
mendelsohn.initialize();

const screenshotFidelity = 1; // 1 is 1:1 pixel size
const testPageName = "VRT Testing";
const baselineNameSuffix = " BASELINE";
const testNameSuffix = " TEST";
const diffNameSuffix = " DIFF";
const passingTestPrefix = "✅ PASS ";
const failingTestPrefix = "🛑 FAIL ";
const LAYOUT_GUTTER = 60; // make configurable
let testPage = null;

const allTestsFrame = new TestGroup(figma.currentPage);

const findOrCreateTestPage = () => {
  testPage = figma.root.findOne((p) => p.name === testPageName);
  if (testPage === null) {
    testPage = figma.createPage();
    testPage.name = testPageName;
  }
  return testPage;
};

const getBaselineFrames = (testPage) => {
  console.log(testPage.children);
  const baselineFrames = testPage.findChildren((fNode) =>
    fNode.name.includes(baselineNameSuffix)
  );
  return baselineFrames;
};

const convertFrameToImage = async (frame) => {
  return await frame.exportAsync({
    format: "PNG",
    constraint: { type: "SCALE", value: screenshotFidelity },
  });
};

const createDiffFrame = async (
  diffUInt8Array,
  pixelDiffCount,
  baselineFrameId,
  testFrameId
) => {
  const baselineFrame = figma.getNodeById(baselineFrameId) as FrameNode;
  const testFrame = figma.getNodeById(testFrameId) as FrameNode;
  const diffFrame = figma.createFrame();
  const diffFrameWidth = Math.max(baselineFrame.width, testFrame.width);
  const diffFrameHeight = Math.max(baselineFrame.height, testFrame.height);

  diffFrame.resize(diffFrameWidth, diffFrameHeight);

  const passFailMessage =
    pixelDiffCount === 0 ? passingTestPrefix : failingTestPrefix;
  diffFrame.name = `${passFailMessage}${baselineFrame.name.replace(
    baselineNameSuffix,
    ""
  )}${diffNameSuffix}`;

  testPage.appendChild(diffFrame);
  diffFrame.x = testFrame.x + testFrame.width + LAYOUT_GUTTER;
  diffFrame.y = testFrame.y;
  diffFrame.fills = [
    {
      type: "IMAGE",
      imageHash: figma.createImage(diffUInt8Array).hash,
      scaleMode: "FILL",
    },
    // {type: 'IMAGE', imageHash: baselineImage.hash, scaleMode: 'FIT'}
  ];
};

const requestImageDiff = (imageData) => {
  console.log("RID");
  // Send the raw bytes of the file to the worker.
  figma.ui.postMessage({ type: "get-image-diff", imageData });
};

// Creates a new frame with same dimensions as a given node
const createNewFrameForNode = (fNode) => {
  const newFrame = figma.createFrame();
  newFrame.resize(fNode.width, fNode.height);
  newFrame.name = fNode.name;
  return newFrame;
};

const createBaselineFrame = async (fNodeId) => {
  const fNode = figma.getNodeById(fNodeId);
  const screenshotBytes = await convertFrameToImage(fNode);
  const screenshotImageHash = figma.createImage(screenshotBytes).hash;
  const baselineFrame = createNewFrameForNode(fNode);
  baselineFrame.name = `${baselineFrame.name}${baselineNameSuffix}`;
  baselineFrame.locked = true;
  testPage.appendChild(baselineFrame);
  baselineFrame.fills = [
    { type: "IMAGE", imageHash: screenshotImageHash, scaleMode: "FILL" },
  ];

  // baseline position: x position is always zero, y position should be 20px below lowest baseline frame;
  baselineFrame.x = 0;
  const baselineFrames = getBaselineFrames(testPage);
  let yPosition = 0;
  baselineFrames.forEach((bf) => {
    const bottom = bf.y + bf.height;
    yPosition = Math.max(bottom, yPosition);
  }); // slow, have to iterate over ALL baseline frames
  baselineFrame.y = yPosition + LAYOUT_GUTTER;

  baselineFrame.setPluginData("originNodeId", fNodeId);

  sendBaselinesToUi(); // Update the UI
};

const getTestFrames = (baselineFrame) => {
  const testFrameName = `${baselineFrame.name.replace(
    baselineNameSuffix,
    ""
  )}${testNameSuffix}`;
  const testFrames = testPage.findChildren((frame) => {
    return frame.name.includes(testFrameName);
  });
  return testFrames;
};

const getDiffFrames = (baselineFrame) => {
  const diffFrameName = `${baselineFrame.name.replace(
    baselineNameSuffix,
    ""
  )}${diffNameSuffix}`;
  const diffFrames = testPage.findChildren((frame) => {
    return frame.name.includes(diffFrameName);
  });
  return diffFrames;
};

const deleteTestFrames = (baselineFrame) => {
  const testFrames = getTestFrames(baselineFrame);
  testFrames.forEach((frame) => frame.remove());
};

const deleteDiffFrames = (baselineFrame) => {
  const diffFrames = getDiffFrames(baselineFrame);
  diffFrames.forEach((frame) => frame.remove());
};

const createTest = async ({ baselineFrameId, originNodeId }) => {
  const baselineFrame = figma.getNodeById(baselineFrameId) as FrameNode;
  // Delete existing test frame(s)
  deleteTestFrames(baselineFrame);
  deleteDiffFrames(baselineFrame);
  const originNode = figma.getNodeById(originNodeId);
  // baselineFrame already has an image, need to get the bytes
  // originNode needs a fresh screenshot
  const testImageBytes = await convertFrameToImage(originNode);
  const testImageHash = figma.createImage(testImageBytes).hash;
  const testFrame = createNewFrameForNode(originNode);
  testFrame.name = `${originNode.name}${testNameSuffix}`;
  testPage.appendChild(testFrame);
  testFrame.fills = [
    { type: "IMAGE", imageHash: testImageHash, scaleMode: "FILL" },
  ];

  // test frame position: x is always baseline x position plus baseline width plus gap
  testFrame.x = baselineFrame.x + baselineFrame.width + LAYOUT_GUTTER;
  testFrame.y = baselineFrame.y;

  // Request diff image
  const baselineImage = figma.getImageByHash(baselineFrame.fills[0].imageHash);
  const baselineImageBytes = await baselineImage.getBytesAsync();

  // Send image diff request to the UI, a new message will be posted with the response
  requestImageDiff({
    baseline: {
      image: baselineImageBytes,
      height: baselineFrame.height,
      width: baselineFrame.width,
      nodeId: baselineFrameId,
    },
    test: {
      image: testImageBytes,
      height: testFrame.height,
      width: testFrame.width,
      nodeId: testFrame.id,
    },
  });
};

const sendCurrentSelectionToUi = () => {
  const serializedSelection = figma.currentPage.selection.map((fNode) => {
    return { name: fNode.name, id: fNode.id };
  });
  figma.ui.postMessage({
    type: "current-selection-changed",
    data: serializedSelection,
  });
};

const sendBaselinesToUi = () => {
  const baselineFrames = getBaselineFrames(testPage);
  const serializedSelection = baselineFrames.map((fNode) => {
    return {
      name: fNode.name.replace(baselineNameSuffix, ""),
      id: fNode.id,
      originNodeId: fNode.getPluginData("originNodeId"),
    };
  });
  figma.ui.postMessage({
    type: "baseline-frames-changed",
    data: serializedSelection,
  });
};

const launchUi = () => {
  figma.showUI(__html__, { visible: true, height: 500, width: 240 });
};

const initialize = () => {
  const testPage = findOrCreateTestPage();
  launchUi();
  sendBaselinesToUi();
  sendCurrentSelectionToUi();
  figma.on("selectionchange", sendCurrentSelectionToUi);
};

// initialize();
// launchUi();

figma.ui.onmessage = (message) => {
  switch (message.type) {
    case "create-baseline":
      createBaselineFrame(message.data);
      break;
    case "create-test":
      createTest(message.data);
      break;
    case "create-tests-from-current-selection":
      mendelsohn.createTestsFromCurrentSelection();
      break;
    case "diff-created":
      console.log("Diff Created", message.data);
      createDiffFrame(
        message.data.encodedImageDiff,
        message.data.pixelDiffCount,
        message.data.baselineNodeId,
        message.data.testNodeId
      );
      break;
    default:
      console.log(message);
  }
};

/*
  Class Objects:
  Figma Document (listen for onmessage events and route)
  All Tests Frame (one per page)
  Test Frame (multiple, per all tests frame)
*/

/* On load:
 *  scan for all TestsGroupFrames as children of Pages ✅
 *  get current baseline frames ✅
 *  get current selection -> send selection to UI
 *  on selection change -> send selection to UI
 */
