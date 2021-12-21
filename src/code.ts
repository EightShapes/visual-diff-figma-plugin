import { Mendelsohn } from "./figmaClasses/Mendelsohn";
import { TestWrapper } from "./figmaClasses/TestWrapper";

const mendelsohn = new Mendelsohn();
mendelsohn.initialize();

figma.ui.on("message", (message) => {
  if (message.type === "create-tests-from-current-selection") {
    mendelsohn.createTestsFromCurrentSelection();
  }

  if (message.type === "run-tests") {
    const testIds = message.data.testIds;
    mendelsohn.runTests(testIds);
  }

  if (message.type === "zoom-viewport") {
    const nodeIds = message.data.nodeIds;
    mendelsohn.centerViewportOnNodeIds(nodeIds);
  }

  if (message.type === "change-test-view") {
    const testFrameId = message.data.testFrameId;
    const view = message.data.view;
    const test = new TestWrapper(testFrameId);
    test.setViewState(view);
  }

  if (message.type === "display-mode-proportion-change") {
    const testFrameId = message.data.testFrameId;
    const proportion = message.data.proportion;
    const test = new TestWrapper(testFrameId);
    test.setViewProportion(proportion);
  }

  if (message.type === "save-new-snapshot") {
    const testFrameId = message.data.testFrameId;
    const test = new TestWrapper(testFrameId);
    test.saveNewBasline();
  }
});
