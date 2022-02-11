import { TestWrapper } from "./TestWrapper";

export class TestGroup {
  constructor(nodeId, mendelsohnInstance) {
    this.frame = figma.getNodeById(nodeId) as FrameNode;
    this.mendelsohn = mendelsohnInstance;
    this.initializeState(mendelsohnInstance);
  }

  get pageName() {
    return this.frame.parent.name;
  }

  get pageId() {
    return this.frame.parent.id;
  }

  get testNodes() {
    return this.frame.findChildren(
      (child) => child.getPluginData(TestWrapper.TEST_WRAPPER_KEY) === "true"
    );
  }

  get state() {
    return this._state;
  }

  set state(stateObject) {
    this._state = stateObject;
  }

  get testIds() {
    return Object.keys(this.state.tests);
  }

  get serializedTests() {
    const tests = {};
    this.testIds.forEach((id) => {
      tests[id] = this.state.tests[id].serializedData;
    });

    return tests;
  }

  getTestById(id) {
    let test = null;

    if (this.testIds.includes(id)) {
      test = this.state.tests[id];
    }

    return test;
  }

  initializeState(mendelsohnInstance) {
    const stateObject = {
      tests: {},
    };

    this.testNodes.forEach((node) => {
      stateObject.tests[node.id] =
        stateObject.tests[node.id] ||
        new TestWrapper(node.id, mendelsohnInstance);
    });

    this.state = stateObject;
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
