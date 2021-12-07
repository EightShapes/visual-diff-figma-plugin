(() => {
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // src/figmaClasses/AllTestsFrame.ts
  var _AllTestsFrame = class {
    constructor(pageName) {
      return this.findOrCreateAllTestsFrame(pageName);
    }
    copyChildren(children) {
      return children.map((object) => {
        return { id: object.id, y: object.y, x: object.x };
      });
    }
    getNextAvailableCoordinates(pageNode) {
      const childNodes = this.copyChildren(pageNode.children);
      const childNodesSortedByY = childNodes.sort((a, b) => b.y - a.y);
      const lowestChild = figma.getNodeById(childNodesSortedByY[0].id);
      const childNodesSortedByX = childNodes.sort((a, b) => a.x - b.x);
      const leftmostChild = figma.getNodeById(childNodesSortedByX[0].id);
      const x = leftmostChild.x;
      const y = lowestChild.y + lowestChild.height + _AllTestsFrame.LAYOUT_GUTTER;
      return { x, y };
    }
    createAllTestsFrame(pageNode) {
      const allTestsFrame2 = figma.createFrame();
      if (pageNode !== figma.currentPage) {
        pageNode.appendChild(pageNode);
      }
      allTestsFrame2.name = "All Tests";
      allTestsFrame2.setPluginData(_AllTestsFrame.ALL_TESTS_FRAME_KEY, "true");
      allTestsFrame2.layoutMode = "HORIZONTAL";
      allTestsFrame2.primaryAxisSizingMode = "AUTO";
      allTestsFrame2.counterAxisSizingMode = "AUTO";
      allTestsFrame2.itemSpacing = _AllTestsFrame.LAYOUT_GUTTER;
      allTestsFrame2.paddingLeft = _AllTestsFrame.LAYOUT_GUTTER;
      allTestsFrame2.paddingRight = _AllTestsFrame.LAYOUT_GUTTER;
      allTestsFrame2.paddingTop = _AllTestsFrame.LAYOUT_GUTTER;
      allTestsFrame2.paddingBottom = _AllTestsFrame.LAYOUT_GUTTER;
      allTestsFrame2.fills = [];
      allTestsFrame2.strokes = [{
        type: "SOLID",
        color: _AllTestsFrame.EIGHTSHAPES_ORANGE_RGB
      }];
      allTestsFrame2.dashPattern = [10, 10];
      allTestsFrame2.resize(1e3, 400);
      const nextAvailableCoordinates = this.getNextAvailableCoordinates(pageNode);
      allTestsFrame2.x = nextAvailableCoordinates.x;
      allTestsFrame2.y = nextAvailableCoordinates.y;
      return allTestsFrame2;
    }
    findOrCreateAllTestsFrame(pageNode) {
      let allTestsFrame2 = pageNode.findOne((fNode) => fNode.getPluginData(_AllTestsFrame.ALL_TESTS_FRAME_KEY));
      if (allTestsFrame2 === null) {
        allTestsFrame2 = this.createAllTestsFrame(pageNode);
      }
      return allTestsFrame2;
    }
  };
  var AllTestsFrame = _AllTestsFrame;
  AllTestsFrame.EIGHTSHAPES_ORANGE_RGB = { r: 0.909803921568627, g: 0.32156862745098, b: 0 };
  AllTestsFrame.ALL_TESTS_FRAME_KEY = "all-tests-frame";
  AllTestsFrame.LAYOUT_GUTTER = 60;

  // src/code.ts
  var screenshotFidelity = 1;
  var testPageName = "VRT Testing";
  var baselineNameSuffix = " BASELINE";
  var testNameSuffix = " TEST";
  var diffNameSuffix = " DIFF";
  var passingTestPrefix = "\u2705 PASS ";
  var failingTestPrefix = "\u{1F6D1} FAIL ";
  var LAYOUT_GUTTER = 60;
  var testPage = null;
  var allTestsFrame = new AllTestsFrame(figma.currentPage);
  var findOrCreateTestPage = () => {
    testPage = figma.root.findOne((p) => p.name === testPageName);
    if (testPage === null) {
      testPage = figma.createPage();
      testPage.name = testPageName;
    }
    return testPage;
  };
  var getBaselineFrames = (testPage2) => {
    console.log(testPage2.children);
    const baselineFrames = testPage2.findChildren((fNode) => fNode.name.includes(baselineNameSuffix));
    return baselineFrames;
  };
  var convertFrameToImage = (frame) => __async(void 0, null, function* () {
    return yield frame.exportAsync({
      format: "PNG",
      constraint: { type: "SCALE", value: screenshotFidelity }
    });
  });
  var createDiffFrame = (diffUInt8Array, pixelDiffCount, baselineFrameId, testFrameId) => __async(void 0, null, function* () {
    const baselineFrame = figma.getNodeById(baselineFrameId);
    const testFrame = figma.getNodeById(testFrameId);
    const diffFrame = figma.createFrame();
    const diffFrameWidth = Math.max(baselineFrame.width, testFrame.width);
    const diffFrameHeight = Math.max(baselineFrame.height, testFrame.height);
    diffFrame.resize(diffFrameWidth, diffFrameHeight);
    const passFailMessage = pixelDiffCount === 0 ? passingTestPrefix : failingTestPrefix;
    diffFrame.name = `${passFailMessage}${baselineFrame.name.replace(baselineNameSuffix, "")}${diffNameSuffix}`;
    testPage.appendChild(diffFrame);
    diffFrame.x = testFrame.x + testFrame.width + LAYOUT_GUTTER;
    diffFrame.y = testFrame.y;
    diffFrame.fills = [
      {
        type: "IMAGE",
        imageHash: figma.createImage(diffUInt8Array).hash,
        scaleMode: "FILL"
      }
    ];
  });
  var requestImageDiff = (imageData) => {
    console.log("RID");
    figma.ui.postMessage({ type: "get-image-diff", imageData });
  };
  var createNewFrameForNode = (fNode) => {
    const newFrame = figma.createFrame();
    newFrame.resize(fNode.width, fNode.height);
    newFrame.name = fNode.name;
    return newFrame;
  };
  var createBaselineFrame = (fNodeId) => __async(void 0, null, function* () {
    const fNode = figma.getNodeById(fNodeId);
    const screenshotBytes = yield convertFrameToImage(fNode);
    const screenshotImageHash = figma.createImage(screenshotBytes).hash;
    const baselineFrame = createNewFrameForNode(fNode);
    baselineFrame.name = `${baselineFrame.name}${baselineNameSuffix}`;
    baselineFrame.locked = true;
    testPage.appendChild(baselineFrame);
    baselineFrame.fills = [
      { type: "IMAGE", imageHash: screenshotImageHash, scaleMode: "FILL" }
    ];
    baselineFrame.x = 0;
    const baselineFrames = getBaselineFrames(testPage);
    let yPosition = 0;
    baselineFrames.forEach((bf) => {
      const bottom = bf.y + bf.height;
      yPosition = Math.max(bottom, yPosition);
    });
    baselineFrame.y = yPosition + LAYOUT_GUTTER;
    baselineFrame.setPluginData("originNodeId", fNodeId);
    sendBaselinesToUi();
  });
  var getTestFrames = (baselineFrame) => {
    const testFrameName = `${baselineFrame.name.replace(baselineNameSuffix, "")}${testNameSuffix}`;
    const testFrames = testPage.findChildren((frame) => {
      return frame.name.includes(testFrameName);
    });
    return testFrames;
  };
  var getDiffFrames = (baselineFrame) => {
    const diffFrameName = `${baselineFrame.name.replace(baselineNameSuffix, "")}${diffNameSuffix}`;
    const diffFrames = testPage.findChildren((frame) => {
      return frame.name.includes(diffFrameName);
    });
    return diffFrames;
  };
  var deleteTestFrames = (baselineFrame) => {
    const testFrames = getTestFrames(baselineFrame);
    testFrames.forEach((frame) => frame.remove());
  };
  var deleteDiffFrames = (baselineFrame) => {
    const diffFrames = getDiffFrames(baselineFrame);
    diffFrames.forEach((frame) => frame.remove());
  };
  var createTest = (_0) => __async(void 0, [_0], function* ({ baselineFrameId, originNodeId }) {
    const baselineFrame = figma.getNodeById(baselineFrameId);
    deleteTestFrames(baselineFrame);
    deleteDiffFrames(baselineFrame);
    const originNode = figma.getNodeById(originNodeId);
    const testImageBytes = yield convertFrameToImage(originNode);
    const testImageHash = figma.createImage(testImageBytes).hash;
    const testFrame = createNewFrameForNode(originNode);
    testFrame.name = `${originNode.name}${testNameSuffix}`;
    testPage.appendChild(testFrame);
    testFrame.fills = [
      { type: "IMAGE", imageHash: testImageHash, scaleMode: "FILL" }
    ];
    testFrame.x = baselineFrame.x + baselineFrame.width + LAYOUT_GUTTER;
    testFrame.y = baselineFrame.y;
    const baselineImage = figma.getImageByHash(baselineFrame.fills[0].imageHash);
    const baselineImageBytes = yield baselineImage.getBytesAsync();
    requestImageDiff({
      baseline: {
        image: baselineImageBytes,
        height: baselineFrame.height,
        width: baselineFrame.width,
        nodeId: baselineFrameId
      },
      test: {
        image: testImageBytes,
        height: testFrame.height,
        width: testFrame.width,
        nodeId: testFrame.id
      }
    });
  });
  var sendCurrentSelectionToUi = () => {
    const serializedSelection = figma.currentPage.selection.map((fNode) => {
      return { name: fNode.name, id: fNode.id };
    });
    figma.ui.postMessage({
      type: "current-selection-changed",
      data: serializedSelection
    });
  };
  var sendBaselinesToUi = () => {
    const baselineFrames = getBaselineFrames(testPage);
    const serializedSelection = baselineFrames.map((fNode) => {
      return {
        name: fNode.name.replace(baselineNameSuffix, ""),
        id: fNode.id,
        originNodeId: fNode.getPluginData("originNodeId")
      };
    });
    figma.ui.postMessage({
      type: "baseline-frames-changed",
      data: serializedSelection
    });
  };
  var launchUi = () => {
    figma.showUI(__html__, { visible: true, height: 500, width: 240 });
  };
  var initialize = () => {
    const testPage2 = findOrCreateTestPage();
    launchUi();
    sendBaselinesToUi();
    sendCurrentSelectionToUi();
    figma.on("selectionchange", sendCurrentSelectionToUi);
  };
  initialize();
  figma.ui.onmessage = (message) => {
    switch (message.type) {
      case "create-baseline":
        createBaselineFrame(message.data);
        break;
      case "create-test":
        createTest(message.data);
        break;
      case "diff-created":
        console.log("Diff Created", message.data);
        createDiffFrame(message.data.encodedImageDiff, message.data.pixelDiffCount, message.data.baselineNodeId, message.data.testNodeId);
        break;
      default:
        console.log(message);
    }
  };
})();
