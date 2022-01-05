import { Mendelsohn } from "./Mendelsohn";
import { Baseline } from "./Baseline";
import { LanguageConstants } from "../LanguageConstants";

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
  static TEST_STATUS_METADATA_KEY = "test-status-metadata";
  static UPDATED_AT_METADATA_KEY = "updated-at-metadata";
  static METADATA_NODE_KEY = "mendelsohn-metadata-node";
  static TITLE_FONT_SIZE = 12;
  static SNAPSHOT_LABEL = "Mendelsohn snapshot";
  static SPACING = 16;
  static STACK_SPACING = 10;
  static CORNER_RADIUS = 8;
  static DASH_PATTERN = [4, 4];
  static ERROR_BACKGROUND_OPACITY = 0.07;
  static VIEW_PROPORTION_KEY = "mendelsohn-view-proportion";
  static DEFAULT_VIEW_PROPORTION = "0";

  static async createNewTestMetadata(name) {
    const metadataFrame = figma.createFrame();
    metadataFrame.layoutMode = "VERTICAL";
    metadataFrame.layoutAlign = "STRETCH";
    metadataFrame.primaryAxisSizingMode = "FIXED";
    metadataFrame.counterAxisSizingMode = "AUTO";
    metadataFrame.fills = [];
    metadataFrame.setPluginData(TestWrapper.METADATA_NODE_KEY, "true");

    const title = figma.createText();
    title.layoutAlign = "STRETCH";
    title.fontName = Mendelsohn.BOLD_FONT;
    title.fontSize = TestWrapper.TITLE_FONT_SIZE;
    title.characters = `${TestWrapper.SNAPSHOT_LABEL}`;

    const status = figma.createText();
    status.layoutAlign = "STRETCH";
    status.fontName = Mendelsohn.DEFAULT_FONT;
    status.fontSize = TestWrapper.TITLE_FONT_SIZE;
    status.characters = LanguageConstants.EMPTY_STATUS_LABEL;
    status.setPluginData(TestWrapper.TEST_STATUS_METADATA_KEY, "true");

    metadataFrame.appendChild(title);
    metadataFrame.appendChild(status);

    const updatedAt = figma.createText();
    updatedAt.layoutAlign = "STRETCH";
    updatedAt.fontName = Mendelsohn.DEFAULT_FONT;
    updatedAt.fontSize = TestWrapper.TITLE_FONT_SIZE;
    updatedAt.characters = Mendelsohn.timestamp;
    updatedAt.setPluginData(TestWrapper.UPDATED_AT_METADATA_KEY, "true");

    metadataFrame.appendChild(updatedAt);
    return metadataFrame;
  }

  static createNewImageWrapper(name) {
    const imageWrapper = figma.createFrame();
    imageWrapper.layoutMode = "HORIZONTAL";
    imageWrapper.primaryAxisSizingMode = "AUTO";
    imageWrapper.counterAxisSizingMode = "AUTO";
    imageWrapper.itemSpacing = TestWrapper.SPACING;
    imageWrapper.setPluginData(TestWrapper.IMAGE_WRAPPER_KEY, "true");
    imageWrapper.name = `${name}${TestWrapper.IMAGE_WRAPPER_SUFFIX}`;
    imageWrapper.fills = [];
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
      Mendelsohn.timestamp
    );
    testWrapper.setPluginData(
      TestWrapper.VIEW_PROPORTION_KEY,
      TestWrapper.DEFAULT_VIEW_PROPORTION
    );
    testWrapper.layoutMode = "VERTICAL";
    testWrapper.primaryAxisSizingMode = "AUTO";
    testWrapper.counterAxisSizingMode = "AUTO";
    testWrapper.itemSpacing = TestWrapper.STACK_SPACING;
    testWrapper.paddingLeft = TestWrapper.SPACING;
    testWrapper.paddingRight = TestWrapper.SPACING;
    testWrapper.paddingTop = TestWrapper.SPACING;
    testWrapper.paddingBottom = TestWrapper.SPACING;
    testWrapper.fills = [];
    testWrapper.strokes = [
      {
        type: "SOLID",
        color: Mendelsohn.BLACK_RGB,
      },
    ];
    testWrapper.dashPattern = TestWrapper.DASH_PATTERN;
    testWrapper.cornerRadius = TestWrapper.CORNER_RADIUS;

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
    console.log("CONSTRUCTOR FRAME", this.frame);
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

  get originNodeId() {
    return this.frame.getPluginData(TestWrapper.ORIGIN_NODE_ID_KEY);
  }

  get originNode() {
    return figma.getNodeById(this.originNodeId);
  }

  get viewProportion() {
    return this.frame.getPluginData(TestWrapper.VIEW_PROPORTION_KEY);
  }

  set viewProportion(viewProportion) {
    this.frame.setPluginData(TestWrapper.VIEW_PROPORTION_KEY, viewProportion);
  }

  get serializedData() {
    return {
      name: this.frame.name,
      id: this.frame.id,
      originNodeId: this.originNodeId,
      status: this.status,
      createdAt: this.createdAt,
      lastRunAt: this.lastRunAt,
      viewProportion: this.viewProportion,
    };
  }

  get status() {
    return this.frame.getPluginData(TestWrapper.TEST_STATUS_KEY);
  }

  get createdAt() {
    return this.frame.getPluginData(TestWrapper.TEST_WRAPPER_CREATED_AT_KEY);
  }

  get lastRunAt() {
    return this.frame.getPluginData(TestWrapper.TEST_WRAPPER_LAST_RUN_AT_KEY);
  }

  set lastRunAt(lastRunAt) {
    this.frame.setPluginData(
      TestWrapper.TEST_WRAPPER_LAST_RUN_AT_KEY,
      lastRunAt
    );
  }

  get metadataNode() {
    return this.frame.findChild(
      (node) => node.getPluginData(TestWrapper.METADATA_NODE_KEY) === "true"
    );
  }

  get statusMetadataNode() {
    return this.metadataNode.findChild(
      (node) =>
        node.getPluginData(TestWrapper.TEST_STATUS_METADATA_KEY) === "true"
    );
  }

  get updatedAtMetadataNode() {
    return this.metadataNode.findChild(
      (node) =>
        node.getPluginData(TestWrapper.UPDATED_AT_METADATA_KEY) === "true"
    );
  }

  showImageTooLargeError(snapshotType) {
    this.updateTestStatus("baseline-too-large");
  }

  updateBaseline() {
    if (this.baselineFrame === null) {
      const baselineFrame = Baseline.createNewBaselineFrame(this.originNode);
      this.imageWrapper.appendChild(baselineFrame);
    }
    const baseline = new Baseline(this.baselineFrame.id);
    baseline.update();
  }

  saveNewBasline() {
    this.updateBaseline();
    this.resetTestStatus();
    this.postTestDetailUpdate();
    Mendelsohn.postCurrentState();
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
    this.setViewProportion(this.viewProportion);
  }

  initializeTestFrame() {
    if (this.testFrame === null) {
      const testFrame = TestWrapper.createNewFrameForNode(this.baselineFrame);
      testFrame.setPluginData(TestWrapper.TEST_FRAME_KEY, "true");
      testFrame.name = `${this.originNode.name}${TestWrapper.TEST_FRAME_SUFFIX}`;
      testFrame.layoutMode = "VERTICAL";
      testFrame.primaryAxisAlignItems = "CENTER";
      testFrame.primaryAxisSizingMode = "FIXED";
      testFrame.strokes = [
        {
          type: "SOLID",
          color: Mendelsohn.LIGHT_GRAY_RGB,
        },
      ];
      this.imageWrapper.appendChild(testFrame);
    }

    const placeholderText = figma.createText();
    placeholderText.fontName = Mendelsohn.DEFAULT_FONT;
    placeholderText.fontSize = 12;
    placeholderText.characters = "No results, test not yet run.";
    placeholderText.textAlignHorizontal = "CENTER";
    placeholderText.layoutAlign = "STRETCH";
    this.testFrame.fills = [
      {
        type: "SOLID",
        color: Mendelsohn.WHITE_RGB,
      },
    ];
    this.testFrame.appendChild(placeholderText);
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

  resetTestStatus() {
    // RESET THE TEST
    this.updatedAtMetadataNode.characters = Mendelsohn.timestamp;
    this.statusMetadataNode.characters = LanguageConstants.EMPTY_STATUS_LABEL;
    this.statusMetadataNode.fontName = Mendelsohn.DEFAULT_FONT;
    this.statusMetadataNode.fills = [
      {
        type: "SOLID",
        color: Mendelsohn.BLACK_RGB,
      },
    ];
    this.frame.fills = [];
    this.frame.setPluginData(TestWrapper.TEST_STATUS_KEY, "");
    this.frame.setPluginData(TestWrapper.TEST_WRAPPER_LAST_RUN_AT_KEY, "");
    this.lastRunAt = "";
    this.frame.setPluginData(
      TestWrapper.TEST_WRAPPER_CREATED_AT_KEY,
      Mendelsohn.timestamp
    );
    this.frame.setPluginData(
      TestWrapper.VIEW_PROPORTION_KEY,
      TestWrapper.DEFAULT_VIEW_PROPORTION
    );
    this.initializeTestFrame();
    this.setViewProportion(this.viewProportion);
  }

  updateTestStatus(status) {
    const timestamp = Mendelsohn.timestamp;
    this.frame.setPluginData(TestWrapper.TEST_STATUS_KEY, status);

    if (status !== "baseline-too-large") {
      this.lastRunAt = timestamp;
      this.updatedAtMetadataNode.characters = timestamp;
    }

    let statusMessage;
    switch (status) {
      case "pass":
        statusMessage = LanguageConstants.PASS_STATUS_LABEL;
        break;
      case "baseline-too-large":
        statusMessage = LanguageConstants.BASELINE_TOO_LARGE_STATUS_LABEL;
        break;
      case "fail":
        statusMessage = LanguageConstants.FAIL_STATUS_LABEL;
        break;
    }
    this.statusMetadataNode.characters = statusMessage;

    if (status === "fail" || status === "baseline-too-large") {
      this.statusMetadataNode.fills = [
        {
          type: "SOLID",
          color: Mendelsohn.ERROR_RGB,
        },
      ];
      this.statusMetadataNode.fontName = Mendelsohn.BOLD_FONT;
      this.frame.fills = [
        {
          type: "SOLID",
          color: Mendelsohn.ERROR_RGB,
          opacity: TestWrapper.ERROR_BACKGROUND_OPACITY,
        },
      ];
    } else {
      this.frame.fills = [];
      this.statusMetadataNode.fontName = Mendelsohn.DEFAULT_FONT;
      this.statusMetadataNode.fills = [
        {
          type: "SOLID",
          color: Mendelsohn.BLACK_RGB,
        },
      ];
    }

    Mendelsohn.postCurrentState();
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
    const testStatus = pixelDiffCount > 0 ? "fail" : "pass";

    this.updateTestStatus(testStatus);

    const diffHeight = Math.max(
      this.testFrame.height,
      this.baselineFrame.height
    );
    const diffWidth = Math.max(this.testFrame.width, this.baselineFrame.width);

    this.testFrame.resize(diffWidth, diffHeight);
    const testImage = JSON.parse(JSON.stringify(this.testFrame.fills[0]));
    testImage.scaleMode = "FIT";
    const diffImage = {
      type: "IMAGE",
      imageHash: figma.createImage(encodedImageDiff).hash,
      scaleMode: "FILL",
    };

    this.testFrame.fills = [testImage, diffImage];

    this.postTestDetailUpdate();
    Mendelsohn.postCurrentState();
    this.setViewProportion(this.viewProportion);
  }

  setViewProportion(viewProportion) {
    this.viewProportion = viewProportion;
    if (this.testFrame !== null && this.testFrame.fills.length > 1) {
      const testFrameFills = JSON.parse(JSON.stringify(this.testFrame.fills));
      testFrameFills[1].opacity = parseFloat(viewProportion);
      this.testFrame.fills = testFrameFills;
    }
  }
}
