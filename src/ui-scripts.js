import "./components/image-processor";
import "./components/viewport-manager";

const viewportManager = document.querySelector("viewport-manager");
const imageProcessor = document.querySelector("image-processor");

// Handle all messages received from the figma file
onmessage = async (message) => {
  console.log(message);
  switch (message.data.pluginMessage.type) {
    case "state-update":
      const currentState = message.data.pluginMessage.data;
      viewportManager.pagehastests = currentState.pageHasTests;
      viewportManager.testgroupframes = currentState.testGroups;
      viewportManager.currentselection = currentState.currentSelection;
      viewportManager.currentpageid = currentState.currentPageId;
      break;
    case "current-selection-changed":
      viewportManager.view = "test-list";
      viewportManager.currentselection = message.data.pluginMessage.data;
      break;
    case "test-group-frames-update":
      viewportManager.testgroupframes = message.data.pluginMessage.data;
      console.log(message.data.pluginMessage.data);
      break;
    case "active-test-wrapper-changed":
      viewportManager.view = "test-detail";
      viewportManager.activetestwrapper = message.data.pluginMessage.data;
      break;
    case "get-image-diff":
      console.log("switch gid");
      const diffData = await imageProcessor.getImageDiff(
        message.data.pluginMessage
      );
      parent.postMessage(
        { pluginMessage: { type: "diff-created", data: diffData } },
        "*"
      );
      break;
  }
};
