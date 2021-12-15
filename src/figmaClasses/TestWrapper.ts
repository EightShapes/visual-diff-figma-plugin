import { Mendelsohn } from "./Mendelsohn";
import { Baseline } from "./Baseline";

export class TestWrapper {
  static TEST_WRAPPER_SUFFIX = " Test";
  static TEST_WRAPPER_KEY = "mendelsohn-test-wrapper";
  static TEST_WRAPPER_CREATED_AT_KEY = "mendelsohn-test-wrapper-created-at";
  static TEST_WRAPPER_LAST_RUN_AT_KEY = "mendelsohn-test-wrapper-last-run-at";
  static IMAGE_WRAPPER_KEY = "mendelsohn-image-wrapper";
  static IMAGE_WRAPPER_SUFFIX = " Image Wrapper";
  static TEST_FRAME_KEY = "mendelsohn-test-frame";
  static TEST_FRAME_SUFFIX = " Test Frame";
  static BASELINE_FRAME_KEY = "mendelsohn-baseline-frame";
  static ORIGIN_NODE_ID_KEY = "mendelsohn-origin-node-id";
  static TEST_STATUS_KEY = "test-status";
  static TITLE_FONT_SIZE = 24;

  static async createNewTestMetadata(name) {
    const metadataFrame = figma.createFrame();
    metadataFrame.layoutMode = "HORIZONTAL";
    metadataFrame.primaryAxisSizingMode = "AUTO";
    metadataFrame.counterAxisSizingMode = "AUTO";
    const title = figma.createText();
    title.fontName = Mendelsohn.DEFAULT_FONT;
    title.fontSize = TestWrapper.TITLE_FONT_SIZE;
    title.characters = `${name}${TestWrapper.TEST_WRAPPER_SUFFIX}`;
    metadataFrame.appendChild(title);
    return metadataFrame;
  }

  static createNewImageWrapper(name) {
    const imageWrapper = figma.createFrame();
    imageWrapper.layoutMode = "HORIZONTAL";
    imageWrapper.primaryAxisSizingMode = "AUTO";
    imageWrapper.counterAxisSizingMode = "AUTO";
    imageWrapper.itemSpacing = Mendelsohn.LAYOUT_GUTTER;
    imageWrapper.setPluginData(TestWrapper.IMAGE_WRAPPER_KEY, "true");
    imageWrapper.name = `${name}${TestWrapper.IMAGE_WRAPPER_SUFFIX}`;
    return imageWrapper;
  }

  static async createNewTestWrapper(originNodeId) {
    const originNode = figma.getNodeById(originNodeId);
    const testWrapper = figma.createFrame();
    testWrapper.name = `${originNode.name}${TestWrapper.TEST_WRAPPER_SUFFIX}`;
    testWrapper.setPluginData(TestWrapper.TEST_WRAPPER_KEY, "true");
    testWrapper.setPluginData(TestWrapper.ORIGIN_NODE_ID_KEY, originNode.id);
    testWrapper.setPluginData(
      TestWrapper.TEST_WRAPPER_CREATED_AT_KEY,
      new Date().toString()
    );
    testWrapper.layoutMode = "VERTICAL";
    testWrapper.primaryAxisSizingMode = "AUTO";
    testWrapper.counterAxisSizingMode = "AUTO";
    testWrapper.itemSpacing = Mendelsohn.LAYOUT_GUTTER / 2;
    testWrapper.paddingLeft = Mendelsohn.LAYOUT_GUTTER / 2;
    testWrapper.paddingRight = Mendelsohn.LAYOUT_GUTTER / 2;
    testWrapper.paddingTop = Mendelsohn.LAYOUT_GUTTER;
    testWrapper.paddingBottom = Mendelsohn.LAYOUT_GUTTER;
    testWrapper.resize(100, 100);
    const testMetadata = await TestWrapper.createNewTestMetadata(
      originNode.name
    );
    testWrapper.appendChild(testMetadata);
    const imageWrapper = TestWrapper.createNewImageWrapper(originNode.name);
    testWrapper.appendChild(imageWrapper);
    return testWrapper;
  }

  static createNewFrameForNode = (fNode) => {
    const newFrame = figma.createFrame();
    newFrame.resize(fNode.width, fNode.height);
    newFrame.name = fNode.name;
    return newFrame;
  };

  constructor(testFrameId) {
    this.frame = figma.getNodeById(testFrameId); // TODO: Research the arbitrary assignment of instance properties, is this valid?
  }

  get imageWrapper() {
    return this.frame.findChild(
      (node) => node.getPluginData(TestWrapper.IMAGE_WRAPPER_KEY) === "true"
    );
  }

  get baselineFrame() {
    return this.imageWrapper.findChild(
      (node) => node.getPluginData(TestWrapper.BASELINE_FRAME_KEY) === "true"
    );
  }

  get testFrame() {
    return this.imageWrapper.findChild(
      (node) => node.getPluginData(TestWrapper.TEST_FRAME_KEY) === "true"
    );
  }

  get originNode() {
    const originNodeId = this.frame.getPluginData(
      TestWrapper.ORIGIN_NODE_ID_KEY
    );
    return figma.getNodeById(originNodeId);
  }

  get serializedData() {
    return {
      name: this.frame.name,
      id: this.frame.id,
      status: this.status,
      created_at: this.created_at,
      last_run_at: this.last_run_at,
    };
  }

  get status() {
    return this.frame.getPluginData(TestWrapper.TEST_STATUS_KEY);
  }

  get created_at() {
    return this.frame.getPluginData(TestWrapper.TEST_WRAPPER_CREATED_AT_KEY);
  }

  get last_run_at() {
    return this.frame.getPluginData(TestWrapper.TEST_WRAPPER_LAST_RUN_AT_KEY);
  }

  updateBaseline() {
    if (this.baselineFrame === null) {
      const baselineFrame = Baseline.createNewBaselineFrame(this.originNode);
      this.imageWrapper.appendChild(baselineFrame);
    }
    const baseline = new Baseline(this.baselineFrame.id);
    baseline.update();
  }

  removeTestPlaceholderText() {
    const placeholderText = this.testFrame.children[0];
    if (placeholderText !== undefined) {
      placeholderText.remove();
    }
  }

  async updateTestFrame() {
    this.removeTestPlaceholderText();
    const screenshotBytes = await Mendelsohn.convertFrameToImage(
      this.originNode
    );
    const screenshotImageHash = figma.createImage(screenshotBytes).hash;
    this.testFrame.fills = [
      { type: "IMAGE", imageHash: screenshotImageHash, scaleMode: "FILL" },
    ];
    this.testFrame.resize(this.originNode.width, this.originNode.height);
  }

  initialize() {
    this.updateBaseline();
    this.initializeTestFrame();
  }

  initializeTestFrame() {
    if (this.testFrame === null) {
      const testFrame = TestWrapper.createNewFrameForNode(this.baselineFrame);
      testFrame.name = `${this.originNode.name}${TestWrapper.TEST_FRAME_SUFFIX}`;
      testFrame.setPluginData(TestWrapper.TEST_FRAME_KEY, "true");
      testFrame.layoutMode = "VERTICAL";
      testFrame.primaryAxisAlignItems = "CENTER";
      testFrame.primaryAxisSizingMode = "FIXED";
      testFrame.strokes = [
        {
          type: "SOLID",
          color: Mendelsohn.LIGHT_GRAY_RGB,
        },
      ];
      const placeholderText = figma.createText();
      placeholderText.fontName = Mendelsohn.DEFAULT_FONT;
      placeholderText.fontSize = 12;
      placeholderText.characters = "No results, test not yet run.";
      placeholderText.textAlignHorizontal = "CENTER";
      placeholderText.layoutAlign = "STRETCH";
      testFrame.appendChild(placeholderText);
      this.imageWrapper.appendChild(testFrame);
    }
  }

  async createImageDiff() {
    const baselineImage = figma.getImageByHash(
      this.baselineFrame.fills[0].imageHash
    );
    const baselineImageBytes = await baselineImage.getBytesAsync();

    const testImage = figma.getImageByHash(this.testFrame.fills[0].imageHash);
    const testImageBytes = await testImage.getBytesAsync();

    const imageData = {
      baseline: {
        image: baselineImageBytes,
        height: this.baselineFrame.height,
        width: this.baselineFrame.width,
        nodeId: this.baselineFrame.id,
      },
      test: {
        image: testImageBytes,
        height: this.testFrame.height,
        width: this.testFrame.width,
        nodeId: this.testFrame.id,
      },
      testId: this.frame.id,
    };

    const response = new Promise((resolve, reject) => {
      const diffCreatedHandler = (msg) => {
        if (msg.type === "diff-created" && msg.testId === this.frame.id) {
          const { encodedImageDiff, pixelDiffCount } = msg.data;
          figma.ui.off("message", diffCreatedHandler); // Remove event handler after it executes so they don't pile up on subsequent runs
          return resolve({ encodedImageDiff, pixelDiffCount });
        }
      };

      figma.ui.on("message", diffCreatedHandler);
    });

    figma.ui.postMessage({
      type: "get-image-diff",
      data: imageData,
    });

    return response;
  }

  updateTestStatus(pixelDiffCount) {
    const status = pixelDiffCount === 0 ? "pass" : "fail";
    this.frame.setPluginData(TestWrapper.TEST_STATUS_KEY, status);
    this.frame.setPluginData(
      TestWrapper.TEST_WRAPPER_LAST_RUN_AT_KEY,
      new Date().toString()
    );
  }

  postTestDetailUpdate() {
    figma.ui.postMessage({
      type: "test-detail-update",
      data: this.serializedData,
    });
  }

  async runTest() {
    await this.updateTestFrame();

    const { encodedImageDiff, pixelDiffCount } = await this.createImageDiff();

    this.updateTestStatus(pixelDiffCount);

    const diffHeight = Math.max(
      this.testFrame.height,
      this.baselineFrame.height
    );
    const diffWidth = Math.max(this.testFrame.width, this.baselineFrame.width);

    this.testFrame.resize(diffWidth, diffHeight);

    this.testFrame.fills = [
      {
        type: "IMAGE",
        imageHash: figma.createImage(encodedImageDiff).hash,
        scaleMode: "FILL",
      },
    ];

    this.postTestDetailUpdate();
  }
}
