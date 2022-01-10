import { Mendelsohn } from "./Mendelsohn";
import { Baseline } from "./Baseline";
import { LanguageConstants } from "../LanguageConstants";
import { MendelsohnConstants } from "../MendelsohnConstants";

export class TestWrapper {
  static TEST_WRAPPER_SUFFIX = " Test";
  static TEST_WRAPPER_KEY = "mendelsohn-test-wrapper";
  static TEST_WRAPPER_CREATED_AT_KEY = "mendelsohn-test-wrapper-created-at";
  static TEST_WRAPPER_LAST_RUN_AT_KEY = "mendelsohn-test-wrapper-last-run-at";
  static IMAGE_WRAPPER_KEY = "mendelsohn-image-wrapper";
  static IMAGE_WRAPPER_SUFFIX = " Image Wrapper";
  static TEST_FRAME_KEY = "mendelsohn-test-frame";
  static TEST_FRAME_SUFFIX = " Test Frame";
  static EMPTY_TEST_IMAGE_PLACEHOLDER_NODE_KEY =
    "mendelsohn-empty-test-image-placeholder-node";
  static BASELINE_FRAME_KEY = "mendelsohn-baseline-frame";
  static BASELINE_FRAME_WRAPPER_KEY = "mendelsohn-baseline-frame-wrapper";
  static TEST_FRAME_WRAPPER_KEY = "mendelsohn-test-frame-wrapper";
  static ORIGIN_NODE_ID_KEY = "mendelsohn-origin-node-id";
  static TEST_STATUS_KEY = "test-status";
  static TEST_STATUS_METADATA_KEY = "test-status-metadata";
  static UPDATED_AT_METADATA_KEY = "updated-at-metadata";
  static METADATA_NODE_KEY = "mendelsohn-metadata-node";
  static TITLE_FONT_SIZE = 12;
  static LABEL_FONT_SIZE = 10;
  static SNAPSHOT_LABEL = "Mendelsohn snapshot";
  static SPACING = 16;
  static STACK_SPACING = 10;
  static LABEL_SPACING = 8;
  static CORNER_RADIUS = 8;
  static DASH_PATTERN = [4, 4];
  static ERROR_BACKGROUND_OPACITY = 0.07;
  static VIEW_PROPORTION_KEY = "mendelsohn-view-proportion";
  static DEFAULT_VIEW_PROPORTION = "0";
  static WRAPPER_STROKE_DEFAULT = {
    // TODO: Reference constant
    type: "SOLID",
    color: {
      r: 0.631372549019608,
      g: 0.631372549019608,
      b: 0.631372549019608,
    },
  };
  static WRAPPER_STROKE_ERROR = {
    // TODO: Reference constant
    type: "SOLID",
    color: {
      r: 0.949019607843137,
      g: 0.282352941176471,
      b: 0.133333333333333,
    },
  };
  static STROKE_WEIGHT_DEFAULT = 1;
  static STROKE_WEIGHT_ERROR = 2;

  static async createNewTestMetadata(name) {
    const metadataFrame = figma.createFrame();
    metadataFrame.layoutMode = "VERTICAL";
    metadataFrame.layoutAlign = "STRETCH";
    metadataFrame.primaryAxisSizingMode = "AUTO";
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
    testWrapper.strokes = [TestWrapper.WRAPPER_STROKE_DEFAULT];
    testWrapper.strokeWeight = 1;
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
  }

  get imageWrapper() {
    return this.frame.findChild(
      (node) => node.getPluginData(TestWrapper.IMAGE_WRAPPER_KEY) === "true"
    );
  }

  get baselineFrame() {
    const baselineFrameWrapper = this.imageWrapper.findChild(
      (node) =>
        node.getPluginData(TestWrapper.BASELINE_FRAME_WRAPPER_KEY) === "true"
    );
    if (baselineFrameWrapper === null) {
      return null;
    }
    return baselineFrameWrapper.findChild(
      (node) => node.getPluginData(TestWrapper.BASELINE_FRAME_KEY) === "true"
    );
  }

  get testFrame() {
    const imageFrameWrapper = this.imageWrapper.findChild(
      (node) =>
        node.getPluginData(TestWrapper.TEST_FRAME_WRAPPER_KEY) === "true"
    );
    if (imageFrameWrapper === null) {
      return null;
    }
    return imageFrameWrapper.findChild(
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
      running: false, // Whenever data is passed from this end, it means the test isn't running
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
    switch (snapshotType) {
      case "baseline":
        this.updateTestStatus(MendelsohnConstants.BASELINE_TOO_LARGE);
        break;
      case "test":
        this.updateTestStatus(MendelsohnConstants.TEST_TOO_LARGE);
        break;
    }
  }

  updateBaseline() {
    if (this.baselineFrame === null) {
      const baselineFrameWrapper = Baseline.createNewBaselineFrame(
        this.originNode
      );
      console.log(baselineFrameWrapper);
      this.imageWrapper.appendChild(baselineFrameWrapper);
    }
    console.log(this.baselineFrame.id);
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
    const placeholderText = this.testFrame.findChild(
      (n) =>
        n.getPluginData(TestWrapper.EMPTY_TEST_IMAGE_PLACEHOLDER_NODE_KEY) ===
        "true"
    );
    if (placeholderText !== null) {
      placeholderText.remove();
    }
  }

  async updateTestFrame() {
    this.removeTestPlaceholderText();
    const screenshotBytes = await Mendelsohn.convertFrameToImage(
      this.originNode
    );
    try {
      const screenshotImageHash = figma.createImage(screenshotBytes).hash;
      this.testFrame.fills = [
        { type: "IMAGE", imageHash: screenshotImageHash, scaleMode: "FILL" },
      ];
      this.testFrame.resize(this.originNode.width, this.originNode.height);
      return true;
    } catch {
      this.showImageTooLargeError("test");
      return false;
    }
  }

  initialize() {
    this.updateBaseline();
    this.initializeTestFrame();
    this.setViewProportion(this.viewProportion);
  }

  initializeTestFrame(message = LanguageConstants.TEST_NOT_RUN_LABEL, size) {
    if (this.testFrame === null) {
      const testFrameWrapper = figma.createFrame();
      testFrameWrapper.layoutMode = "VERTICAL";
      testFrameWrapper.itemSpacing = TestWrapper.LABEL_SPACING;
      testFrameWrapper.counterAxisSizingMode = "AUTO";
      testFrameWrapper.fills = [];
      testFrameWrapper.setPluginData(
        TestWrapper.TEST_FRAME_WRAPPER_KEY,
        "true"
      );

      const label = figma.createText();
      label.layoutAlign = "STRETCH";
      label.fontName = Mendelsohn.DEFAULT_FONT;
      label.fontSize = TestWrapper.LABEL_FONT_SIZE;
      label.characters = `${LanguageConstants.LATEST_TEST_IMAGE_LABEL}`;
      testFrameWrapper.appendChild(label);

      const testFrame = TestWrapper.createNewFrameForNode(this.baselineFrame);
      testFrame.setPluginData(TestWrapper.TEST_FRAME_KEY, "true");
      testFrame.name = `${this.originNode.name}${TestWrapper.TEST_FRAME_SUFFIX}`;
      testFrame.layoutMode = "VERTICAL";
      testFrame.primaryAxisAlignItems = "CENTER";
      testFrame.primaryAxisSizingMode = "FIXED";
      testFrame.strokes = [
        {
          type: "SOLID",
          color: Mendelsohn.GRAY_RGB,
        },
      ];
      testFrame.strokeWeight = 1;

      testFrameWrapper.appendChild(testFrame);
      this.imageWrapper.appendChild(testFrameWrapper);
    }

    if (size) {
      this.testFrame.resize(size, size);
    }

    let placeholderText = this.testFrame.findChild(
      (n) =>
        n.getPluginData(TestWrapper.EMPTY_TEST_IMAGE_PLACEHOLDER_NODE_KEY) ===
        "true"
    );

    if (placeholderText === null) {
      placeholderText = figma.createText();
      placeholderText.setPluginData(
        TestWrapper.EMPTY_TEST_IMAGE_PLACEHOLDER_NODE_KEY,
        "true"
      );
    }

    placeholderText.fontName = Mendelsohn.DEFAULT_FONT;
    placeholderText.fontSize = 12;
    placeholderText.characters = message;
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

    if (
      status !== MendelsohnConstants.BASELINE_TOO_LARGE &&
      status !== MendelsohnConstants.TEST_TOO_LARGE
    ) {
      this.lastRunAt = timestamp;
      this.updatedAtMetadataNode.characters = timestamp;
    }

    let statusMessage;
    switch (status) {
      case "pass":
        statusMessage = LanguageConstants.PASS_STATUS_LABEL;
        break;
      case MendelsohnConstants.BASELINE_TOO_LARGE:
        statusMessage = LanguageConstants.BASELINE_TOO_LARGE_STATUS_LABEL;
        break;
      case MendelsohnConstants.TEST_TOO_LARGE:
        statusMessage = LanguageConstants.TEST_TOO_LARGE_STATUS_LABEL;
        break;
      case "fail":
        statusMessage = LanguageConstants.FAIL_STATUS_LABEL;
        break;
    }

    this.statusMetadataNode.characters = statusMessage;

    if (
      status === "fail" ||
      status === MendelsohnConstants.BASELINE_TOO_LARGE ||
      status === MendelsohnConstants.TEST_TOO_LARGE
    ) {
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
      this.frame.strokes = [TestWrapper.WRAPPER_STROKE_ERROR];
      this.frame.strokeWeight = TestWrapper.STROKE_WEIGHT_ERROR;
    } else {
      this.frame.fills = [];
      this.frame.strokes = [TestWrapper.WRAPPER_STROKE_DEFAULT];
      this.frame.strokeWeight = TestWrapper.STROKE_WEIGHT_DEFAULT;
      this.statusMetadataNode.fontName = Mendelsohn.DEFAULT_FONT;
      this.statusMetadataNode.fills = [
        {
          type: "SOLID",
          color: Mendelsohn.BLACK_RGB,
        },
      ];
    }

    if (status === MendelsohnConstants.TEST_TOO_LARGE) {
      this.initializeTestFrame(
        LanguageConstants.TEST_TOO_LARGE_STATUS_LABEL,
        MendelsohnConstants.DEFAULT_EMPTY_FRAME_SIZE
      );
    }

    this.postTestDetailUpdate();
    Mendelsohn.postCurrentState();
  }

  postTestDetailUpdate() {
    figma.ui.postMessage({
      type: "test-detail-update",
      data: this.serializedData,
    });
  }

  async runTest() {
    const testFrameUpdateSuccessful = await this.updateTestFrame();

    if (testFrameUpdateSuccessful) {
      const { encodedImageDiff, pixelDiffCount } = await this.createImageDiff();
      const testStatus = pixelDiffCount > 0 ? "fail" : "pass";

      this.updateTestStatus(testStatus);

      const diffHeight = Math.max(
        this.testFrame.height,
        this.baselineFrame.height
      );
      const diffWidth = Math.max(
        this.testFrame.width,
        this.baselineFrame.width
      );

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
