import { TestWrapper } from "./TestWrapper";
import { Mendelsohn } from "./Mendelsohn";

export class Baseline {
  static FRAME_NAME_SUFFIX = " Baseline Frame";

  static createNewFrameForNode = (fNode) => {
    const newFrame = figma.createFrame();
    newFrame.resize(fNode.width, fNode.height);
    newFrame.name = fNode.name;
    return newFrame;
  };

  static createNewBaselineFrame(originNode) {
    const baselineFrame = this.createNewFrameForNode(originNode);
    baselineFrame.setPluginData(TestWrapper.BASELINE_FRAME_KEY, "true");
    baselineFrame.locked = true;
    baselineFrame.name = `${originNode.name}${Baseline.FRAME_NAME_SUFFIX}`;
    baselineFrame.strokes = [
      {
        type: "SOLID",
        color: Mendelsohn.LIGHT_GRAY_RGB,
      },
    ];
    return baselineFrame;
  }

  constructor(baselineFrameId) {
    this.frame = figma.getNodeById(baselineFrameId);
  }

  get testWrapperNode() {
    return this.frame.parent.parent;
  }

  get testWrapper() {
    return new TestWrapper(this.testWrapperNode.id);
  }

  get originNode() {
    const originNodeId = this.testWrapperNode.getPluginData(
      TestWrapper.ORIGIN_NODE_ID_KEY
    );
    return figma.getNodeById(originNodeId);
  }

  async update() {
    const screenshotBytes = await Mendelsohn.convertFrameToImage(
      this.originNode
    );
    try {
      const screenshotImageHash = figma.createImage(screenshotBytes).hash;
      this.frame.fills = [
        { type: "IMAGE", imageHash: screenshotImageHash, scaleMode: "FILL" },
      ];
      this.frame.resize(this.originNode.width, this.originNode.height);
    } catch (error) {
      this.testWrapper.showImageTooLargeError("baseline");
    }
  }
}
