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

  // src/figmaClasses/Page.ts
  var Page = class {
    static findTestsGroupFrame(pageNode) {
      return pageNode.findOne((fNode) => fNode.getPluginData(Mendelsohn.ALL_TESTS_FRAME_KEY));
    }
    static copyChildren(children) {
      return children.map((object) => {
        return { id: object.id, y: object.y, x: object.x };
      });
    }
    static getNextAvailableCoordinates(pageNode) {
      const childNodes = Page.copyChildren(pageNode.children);
      const childNodesSortedByY = childNodes.sort((a, b) => b.y - a.y);
      const lowestChild = figma.getNodeById(childNodesSortedByY[0].id);
      const childNodesSortedByX = childNodes.sort((a, b) => a.x - b.x);
      const leftmostChild = figma.getNodeById(childNodesSortedByX[0].id);
      let x, y;
      x = leftmostChild.x;
      y = lowestChild.y + lowestChild.height + Mendelsohn.LAYOUT_GUTTER;
      return { x, y };
    }
    static createTestsGroupFrame(pageNode) {
      const testsGroupFrame = figma.createFrame();
      if (pageNode !== figma.currentPage) {
        pageNode.appendChild(pageNode);
      }
      testsGroupFrame.name = "All Tests";
      testsGroupFrame.setPluginData(Mendelsohn.ALL_TESTS_FRAME_KEY, "true");
      testsGroupFrame.layoutMode = "HORIZONTAL";
      testsGroupFrame.primaryAxisSizingMode = "AUTO";
      testsGroupFrame.counterAxisSizingMode = "AUTO";
      testsGroupFrame.itemSpacing = Mendelsohn.LAYOUT_GUTTER;
      testsGroupFrame.paddingLeft = Mendelsohn.LAYOUT_GUTTER;
      testsGroupFrame.paddingRight = Mendelsohn.LAYOUT_GUTTER;
      testsGroupFrame.paddingTop = Mendelsohn.LAYOUT_GUTTER;
      testsGroupFrame.paddingBottom = Mendelsohn.LAYOUT_GUTTER;
      testsGroupFrame.fills = [];
      testsGroupFrame.strokes = [
        {
          type: "SOLID",
          color: Mendelsohn.EIGHTSHAPES_ORANGE_RGB
        }
      ];
      testsGroupFrame.dashPattern = [10, 10];
      const nextAvailableCoordinates = this.getNextAvailableCoordinates(pageNode);
      testsGroupFrame.x = nextAvailableCoordinates.x;
      testsGroupFrame.y = nextAvailableCoordinates.y;
      return testsGroupFrame;
    }
    static findOrCreateTestsGroupFrame(pageNode) {
      let testsGroupFrame = Page.findTestsGroupFrame(pageNode);
      if (testsGroupFrame === null) {
        testsGroupFrame = this.createTestsGroupFrame(pageNode);
      }
      return testsGroupFrame;
    }
  };

  // src/figmaClasses/Baseline.ts
  var Baseline = class {
    static createNewBaselineFrame(originNode) {
      const baselineFrame = this.createNewFrameForNode(originNode);
      baselineFrame.setPluginData(Test.BASELINE_FRAME_KEY, "true");
      baselineFrame.locked = true;
      return baselineFrame;
    }
    constructor(baselineFrameId) {
      this.frame = figma.getNodeById(baselineFrameId);
    }
    get testWrapper() {
      return this.frame.parent;
    }
    get originNode() {
      const originNodeId = this.frame.parent.getPluginData(Test.ORIGIN_NODE_ID_KEY);
      return figma.getNodeById(originNodeId);
    }
    update() {
      return __async(this, null, function* () {
        const screenshotBytes = yield Mendelsohn.convertFrameToImage(this.originNode);
        const screenshotImageHash = figma.createImage(screenshotBytes).hash;
        this.frame.fills = [
          { type: "IMAGE", imageHash: screenshotImageHash, scaleMode: "FILL" }
        ];
        this.frame.resize(this.originNode.width, this.originNode.height);
      });
    }
  };
  Baseline.createNewFrameForNode = (fNode) => {
    const newFrame = figma.createFrame();
    newFrame.resize(fNode.width, fNode.height);
    newFrame.name = fNode.name;
    return newFrame;
  };

  // src/figmaClasses/Test.ts
  var _Test = class {
    static createNewTestFrame(originNodeId) {
      const originNode = figma.getNodeById(originNodeId);
      const testFrame = figma.createFrame();
      console.log("TF", testFrame);
      testFrame.name = `${originNode.name}${_Test.TEST_FRAME_SUFFIX}`;
      testFrame.setPluginData(_Test.TEST_FRAME_KEY, "true");
      testFrame.setPluginData(_Test.ORIGIN_NODE_ID_KEY, originNode.id);
      testFrame.layoutMode = "VERTICAL";
      testFrame.primaryAxisSizingMode = "AUTO";
      testFrame.counterAxisSizingMode = "AUTO";
      testFrame.itemSpacing = Mendelsohn.LAYOUT_GUTTER;
      testFrame.paddingLeft = Mendelsohn.LAYOUT_GUTTER;
      testFrame.paddingRight = Mendelsohn.LAYOUT_GUTTER;
      testFrame.paddingTop = Mendelsohn.LAYOUT_GUTTER;
      testFrame.paddingBottom = Mendelsohn.LAYOUT_GUTTER;
      testFrame.resize(100, 100);
      return testFrame;
    }
    constructor(testFrameId) {
      this.frame = figma.getNodeById(testFrameId);
    }
    get baselineFrame() {
      return this.frame.findChild((node) => node.getPluginData(_Test.BASELINE_FRAME_KEY) === "true");
    }
    get originNode() {
      const originNodeId = this.frame.getPluginData(_Test.ORIGIN_NODE_ID_KEY);
      return figma.getNodeById(originNodeId);
    }
    updateBaseline() {
      if (this.baselineFrame === null) {
        const baselineFrame = Baseline.createNewBaselineFrame(this.originNode);
        this.frame.appendChild(baselineFrame);
      }
      const baseline = new Baseline(this.baselineFrame.id);
      baseline.update();
    }
  };
  var Test = _Test;
  Test.TEST_FRAME_SUFFIX = " Test";
  Test.TEST_FRAME_KEY = "mendelsohn-test-frame";
  Test.BASELINE_FRAME_KEY = "mendelsohn-baseline-frame";
  Test.ORIGIN_NODE_ID_KEY = "mendelsohn-origin-node-id";
  Test.createNewFrameForNode = (fNode) => {
    const newFrame = figma.createFrame();
    newFrame.resize(fNode.width, fNode.height);
    newFrame.name = fNode.name;
    return newFrame;
  };

  // src/figmaClasses/TestGroup.ts
  var TestGroup = class {
    constructor(nodeId) {
      this.frame = figma.getNodeById(nodeId);
    }
    get pageName() {
      return this.frame.parent.name;
    }
    get tests() {
      return this.frame.findChildren((child) => child.getPluginData(Test.TEST_FRAME_KEY) === "true");
    }
    createNewTests(originNodeIds) {
      originNodeIds.forEach((originNodeId) => {
        const testFrame = Test.createNewTestFrame(originNodeId);
        this.frame.appendChild(testFrame);
        const test = new Test(testFrame.id);
        test.updateBaseline();
      });
    }
  };

  // src/figmaClasses/Mendelsohn.ts
  var _Mendelsohn = class {
    static convertFrameToImage(frame) {
      return __async(this, null, function* () {
        return yield frame.exportAsync({
          format: "PNG",
          constraint: { type: "SCALE", value: _Mendelsohn.SCREENSHOT_FIDELITY }
        });
      });
    }
    sendCurrentSelectionToUi() {
      const serializedSelection = figma.currentPage.selection.map((fNode) => {
        return { name: fNode.name, id: fNode.id };
      });
      figma.ui.postMessage({
        type: "current-selection-changed",
        data: serializedSelection
      });
    }
    sendTestGroupUpdate(testGroups) {
      const serializedTestGroupFrames = JSON.stringify(testGroups.map((testGroup) => {
        return {
          id: testGroup.id,
          pageName: testGroup.pageName,
          testNames: testGroup.tests.map((test) => test.name)
        };
      }));
      console.log(serializedTestGroupFrames);
      figma.ui.postMessage({
        type: "test-group-frames-update",
        data: serializedTestGroupFrames
      });
    }
    currentTestGroups() {
      let testGroups = [];
      figma.root.children.forEach((pageNode) => {
        const testGroup = Page.findTestsGroupFrame(pageNode);
        if (testGroup !== null) {
          testGroups.push(new TestGroup(testGroup.id));
        }
      });
      return testGroups;
    }
    showUi() {
      figma.showUI(__html__, {
        visible: true,
        height: _Mendelsohn.DEFAULT_UI_HEIGHT,
        width: _Mendelsohn.DEFAULT_UI_WIDTH
      });
    }
    createTestsFromCurrentSelection() {
      const originNodes = figma.currentPage.selection;
      const testGroupFrame = Page.findOrCreateTestsGroupFrame(figma.currentPage);
      const testGroup = new TestGroup(testGroupFrame.id);
      testGroup.createNewTests(originNodes.map((node) => node.id));
    }
    initialize() {
      this.showUi();
      this.sendCurrentSelectionToUi();
      this.sendTestGroupUpdate(this.currentTestGroups());
      figma.on("selectionchange", this.sendCurrentSelectionToUi);
    }
  };
  var Mendelsohn = _Mendelsohn;
  Mendelsohn.DEFAULT_UI_HEIGHT = 500;
  Mendelsohn.DEFAULT_UI_WIDTH = 240;
  Mendelsohn.ALL_TESTS_FRAME_KEY = "all-tests-frame";
  Mendelsohn.SCREENSHOT_FIDELITY = 1;
  Mendelsohn.EIGHTSHAPES_ORANGE_RGB = {
    r: 0.909803921568627,
    g: 0.32156862745098,
    b: 0
  };
  Mendelsohn.LAYOUT_GUTTER = 60;

  // src/code.ts
  var mendelsohn = new Mendelsohn();
  mendelsohn.initialize();
  var screenshotFidelity = 1;
  var baselineNameSuffix = " BASELINE";
  var testNameSuffix = " TEST";
  var diffNameSuffix = " DIFF";
  var passingTestPrefix = "\u2705 PASS ";
  var failingTestPrefix = "\u{1F6D1} FAIL ";
  var LAYOUT_GUTTER = 60;
  var testPage = null;
  var allTestsFrame = new TestGroup(figma.currentPage);
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
        createDiffFrame(message.data.encodedImageDiff, message.data.pixelDiffCount, message.data.baselineNodeId, message.data.testNodeId);
        break;
      default:
        console.log(message);
    }
  };
})();
