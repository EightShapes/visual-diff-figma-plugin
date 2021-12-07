import { Mendelsohn } from "./Mendelsohn";
import { Baseline } from "./Baseline";

export class Test {
  static TEST_FRAME_SUFFIX = " Test";
  static TEST_FRAME_KEY = "mendelsohn-test-frame";
  static BASELINE_FRAME_KEY = "mendelsohn-baseline-frame";
  static ORIGIN_NODE_ID_KEY = "mendelsohn-origin-node-id";

  static createNewTestFrame(originNodeId) {
    const originNode = figma.getNodeById(originNodeId);
    const testFrame = figma.createFrame();
    console.log("TF", testFrame);
    testFrame.name = `${originNode.name}${Test.TEST_FRAME_SUFFIX}`;
    testFrame.setPluginData(Test.TEST_FRAME_KEY, "true");
    testFrame.setPluginData(Test.ORIGIN_NODE_ID_KEY, originNode.id);
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

  static createNewFrameForNode = (fNode) => {
    const newFrame = figma.createFrame();
    newFrame.resize(fNode.width, fNode.height);
    newFrame.name = fNode.name;
    return newFrame;
  };

  constructor(testFrameId) {
    this.frame = figma.getNodeById(testFrameId);
  }

  get baselineFrame() {
    return this.frame.findChild(
      (node) => node.getPluginData(Test.BASELINE_FRAME_KEY) === "true"
    );
  }

  get originNode() {
    const originNodeId = this.frame.getPluginData(Test.ORIGIN_NODE_ID_KEY);
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
}
