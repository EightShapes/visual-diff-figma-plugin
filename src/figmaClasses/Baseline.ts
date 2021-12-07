import { Test } from "./Test";
import { Mendelsohn } from "./Mendelsohn";

export class Baseline {
  static createNewFrameForNode = (fNode) => {
    const newFrame = figma.createFrame();
    newFrame.resize(fNode.width, fNode.height);
    newFrame.name = fNode.name;
    return newFrame;
  };

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
    const originNodeId = this.frame.parent.getPluginData(
      Test.ORIGIN_NODE_ID_KEY
    );
    return figma.getNodeById(originNodeId);
  }

  async update() {
    const screenshotBytes = await Mendelsohn.convertFrameToImage(
      this.originNode
    );
    const screenshotImageHash = figma.createImage(screenshotBytes).hash;
    this.frame.fills = [
      { type: "IMAGE", imageHash: screenshotImageHash, scaleMode: "FILL" },
    ];
    this.frame.resize(this.originNode.width, this.originNode.height);
  }
}
