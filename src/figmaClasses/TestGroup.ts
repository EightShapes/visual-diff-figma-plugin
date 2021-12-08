import { TestWrapper } from "./TestWrapper";

export class TestGroup {
  constructor(nodeId) {
    this.frame = figma.getNodeById(nodeId) as FrameNode;
  }

  get pageName() {
    return this.frame.parent.name;
  }

  get tests() {
    return this.frame.findChildren(
      (child) => child.getPluginData(TestWrapper.TEST_WRAPPER_KEY) === "true"
    );
  }

  testExistsForOriginNode(originNodeId) {
    return this.frame.findChild(
      (test) =>
        test.getPluginData(TestWrapper.ORIGIN_NODE_ID_KEY) === originNodeId
    );
  }

  createNewTests(originNodeIds) {
    originNodeIds.forEach(async (originNodeId) => {
      console.log(originNodeId);
      if (this.testExistsForOriginNode(originNodeId) === null) {
        const testWrapperFrame = await TestWrapper.createNewTestWrapper(
          originNodeId
        );
        this.frame.appendChild(testWrapperFrame);
        const testWrapper = new TestWrapper(testWrapperFrame.id);
      } else {
        // A test already exists for this origin node, don't create one.
        figma.notify(`A test already exists for node ID: ${originNodeId}`, {
          error: true,
        });
      }
    });
  }
}
