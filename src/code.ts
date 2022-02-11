import { Mendelsohn } from "./figmaClasses/Mendelsohn";

const mendelsohn = new Mendelsohn();
mendelsohn.initialize();

figma.ui.on("message", (message) => {
  if (message.type === "create-tests-for-nodes") {
    const nodeIds = message.data.nodeIds;
    mendelsohn.createTestsForNodes(nodeIds);
  }

  if (message.type === "run-tests") {
    const testIds = message.data.testIds;
    mendelsohn.runTests(testIds);
  }

  if (message.type === "zoom-viewport") {
    const nodeIds = message.data.nodeIds;
    const select = message.data.select;
    mendelsohn.centerViewportOnNodeIds(nodeIds, select);
  }

  if (message.type === "display-mode-proportion-change") {
    const testFrameId = message.data.testFrameId;
    const proportion = message.data.proportion;
    const test = mendelsohn.getTestById(testFrameId);
    test.setViewProportion(proportion);
  }

  if (message.type === "save-new-snapshots") {
    const testIds = message.data.testIds;
    testIds.forEach((testFrameId) => {
      const test = mendelsohn.getTestById(testFrameId);
      test.saveNewBasline();
    });
  }

  if (message.type === "delete-test") {
    const testFrameId = message.data.testFrameId;
    const test = mendelsohn.getTestById(testFrameId);
    test.delete();
  }

  if (message.type === "refresh-data-from-canvas") {
    mendelsohn.sendStateToUi();
  }

  if (message.type === "show-diff-image") {
    const testFrameId = message.data.testFrameId;
    const diffImageStrobeIndex = message.data.diffImageStrobeIndex;
    const test = mendelsohn.getTestById(testFrameId);
    test.showDiffImage(diffImageStrobeIndex);
  }

  if (message.type === "reset-diff-image") {
    const testFrameId = message.data.testFrameId;
    const test = mendelsohn.getTestById(testFrameId);
    test.showDiffImage(1); // 1 is the numeric index for the default (magenta) diff image
    const viewProportion = test.viewProportion;
    test.setViewProportion(viewProportion);
  }
});
