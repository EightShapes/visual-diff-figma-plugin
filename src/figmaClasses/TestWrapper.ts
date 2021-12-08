import { Mendelsohn } from "./Mendelsohn";
import { Baseline } from "./Baseline";

export class TestWrapper {
  static TEST_WRAPPER_SUFFIX = " Test";
  static TEST_WRAPPER_KEY = "mendelsohn-test-wrapper";
  static IMAGE_WRAPPER_KEY = "mendelsohn-image-wrapper";
  static IMAGE_WRAPPER_SUFFIX = " Image Wrapper";
  static TEST_FRAME_KEY = "mendelsohn-test-frame";
  static TEST_FRAME_SUFFIX = " Test Frame";
  static BASELINE_FRAME_KEY = "mendelsohn-baseline-frame";
  static ORIGIN_NODE_ID_KEY = "mendelsohn-origin-node-id";
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
    this.frame = figma.getNodeById(testFrameId);
    this.updateBaseline();
    this.initializeTestFrame();
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

  get originNode() {
    const originNodeId = this.frame.getPluginData(
      TestWrapper.ORIGIN_NODE_ID_KEY
    );
    return figma.getNodeById(originNodeId);
  }

  updateBaseline() {
    if (this.baselineFrame === null) {
      console.log("ORIGIN NODE", this.originNode);
      const baselineFrame = Baseline.createNewBaselineFrame(this.originNode);
      this.imageWrapper.appendChild(baselineFrame);
    }
    const baseline = new Baseline(this.baselineFrame.id);
    baseline.update();
  }

  initializeTestFrame() {
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
    placeholderText.fontSize = TestWrapper.TITLE_FONT_SIZE;
    placeholderText.characters = "No results, test not yet run.";
    testFrame.appendChild(placeholderText);
    this.imageWrapper.appendChild(testFrame);
  }
}
