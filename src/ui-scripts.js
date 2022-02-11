import "./components/image-processor";
import "./components/viewport-manager";

const viewportManager = document.querySelector("viewport-manager");
const imageProcessor = document.querySelector("image-processor");

document.addEventListener("test-run-requested", (e) => {
  const testId = e.detail.testId;
  if (viewportManager.activetestwrapper.id === testId) {
    const testData = JSON.parse(
      JSON.stringify(viewportManager.activetestwrapper)
    );
    testData.running = true;
    viewportManager.activetestwrapper = testData;
    viewportManager.requestUpdate();
  }
});

// Handle all messages received from the figma file
onmessage = async (message) => {
  switch (message.data.pluginMessage.type) {
    case "change-view":
      const newView = message.data.pluginMessage.data;
      viewportManager.view = newView;
      break;
    case "state-update":
      const currentState = message.data.pluginMessage.data;
      const pageHasTests = message.data.pluginMessage.data.pageHasTests;
      viewportManager.pagehastests = pageHasTests;
      viewportManager.tests =
        currentState.state.pages[currentState.currentPageId].tests;
      viewportManager.currentselection = currentState.currentSelection;
      viewportManager.currentpageid = currentState.currentPageId;
      viewportManager.currenttestgroupid =
        currentState.state.pages[currentState.currentPageId].testGroupNodeId;

      const activeTestWrapperId =
        viewportManager.activetestwrapper === undefined
          ? undefined
          : viewportManager.activetestwrapper.id;
      if (pageHasTests && activeTestWrapperId !== undefined) {
        const newActiveTestWrapperData =
          currentState.state.pages[currentState.currentPageId].tests[
            activeTestWrapperId
          ];

        if (
          newActiveTestWrapperData === undefined &&
          viewportManager.view === "test-detail"
        ) {
          viewportManager.view = "test-list";
        } else {
          viewportManager.activetestwrapper = newActiveTestWrapperData;
        }
      }

      if (!pageHasTests) {
        viewportManager.view = "create-tests";
      }

      break;
    case "current-selection-changed":
      viewportManager.currentselection = message.data.pluginMessage.data;
      break;
    case "test-group-frames-update":
      viewportManager.tests = message.data.pluginMessage.data;
      break;
    case "test-detail-update":
      const testData = message.data.pluginMessage.data;
      // If the activetestwrapper.id is the same as testData.id, then update the activetestwrapper
      if (viewportManager.activetestwrapper.id === testData.id) {
        viewportManager.activetestwrapper = testData;
      }
      break;
    case "active-test-wrapper-changed":
      viewportManager.view = "test-detail";
      viewportManager.activetestwrapper = message.data.pluginMessage.data;
      break;
    case "get-image-diff":
      const diffData = await imageProcessor.getImageDiffData(
        message.data.pluginMessage.data
      );
      parent.postMessage(
        {
          pluginMessage: {
            type: "diff-created",
            data: diffData,
            testId: message.data.pluginMessage.data.testId,
          },
        },
        "*"
      );
      break;
  }
};
