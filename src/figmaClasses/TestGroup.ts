import { TestWrapper } from "./TestWrapper";

export class TestGroup {
  constructor(nodeId) {
    this.frame = figma.getNodeById(nodeId) as FrameNode;
  }

  get pageName() {
    return this.frame.parent.name;
  }

  get pageId() {
    return this.frame.parent.id;
  }

  get tests() {
    return this.frame.findChildren(
      (child) => child.getPluginData(TestWrapper.TEST_WRAPPER_KEY) === "true"
    );
  }

  get serializedData() {
    return {
      pageName: this.pageName,
      pageId: this.pageId,
      tests: this.tests.map((t) => {
        const test = new TestWrapper(t.id);
        return test.serializedData;
      }),
    };
  }

  testExistsForOriginNode(originNodeId) {
    return this.frame.findChild(
      (test) =>
        test.getPluginData(TestWrapper.ORIGIN_NODE_ID_KEY) === originNodeId
    );
  }

  async createNewTests(originNodeIds) {
    const newTestFrames = [];

    for (const originNodeId of originNodeIds) {
      if (this.testExistsForOriginNode(originNodeId) === null) {
        const testWrapperFrame = await TestWrapper.createNewTestWrapper(
          originNodeId
        );
        this.frame.appendChild(testWrapperFrame);
        const testWrapper = new TestWrapper(testWrapperFrame.id);
        testWrapper.initialize();
        newTestFrames.push(testWrapperFrame);
      } else {
        // A test already exists for this origin node, don't create one.
        figma.notify(`A test already exists for node ID: ${originNodeId}`, {
          error: true,
        });
      }
    }

    return newTestFrames;
  }
}
