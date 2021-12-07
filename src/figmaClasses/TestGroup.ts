import { Test } from "./Test";

export class TestGroup {
  constructor(nodeId) {
    this.frame = figma.getNodeById(nodeId) as FrameNode;
  }

  get pageName() {
    return this.frame.parent.name;
  }

  get tests() {
    return this.frame.findChildren(
      (child) => child.getPluginData(Test.TEST_FRAME_KEY) === "true"
    );
  }

  createNewTests(originNodeIds) {
    originNodeIds.forEach((originNodeId) => {
      const testFrame = Test.createNewTestFrame(originNodeId);
      this.frame.appendChild(testFrame);
      const test = new Test(testFrame.id);
      test.updateBaseline();
    });
  }
}
