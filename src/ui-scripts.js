import "./components/image-processor";
import "./components/viewport-manager";

const viewportManager = document.querySelector("viewport-manager");
const imageProcessor = document.querySelector("image-processor");

// Handle all messages received from the figma file
onmessage = async (message) => {
  switch (message.data.pluginMessage.type) {
    case "current-selection-changed":
      viewportManager.view = "test-list";
      viewportManager.currentselection = message.data.pluginMessage.data;
      break;
    case "baseline-frames-changed":
      viewportManager.baselineframes = message.data.pluginMessage.data;
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
