import { Mendelsohn } from "./figmaClasses/Mendelsohn";

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
});
