import { Mendelsohn } from "../figmaClasses/Mendelsohn";

export const MendelsohnMixins = (superClass) =>
  class extends superClass {
    /* class fields & methods to extend superClass with */
    private _changeView(newView, test) {
      window.parent.postMessage(
        {
          pluginMessage: {
            type: "refresh-data-from-canvas",
          },
        },
        "*"
      ); // whenever the plugin view changes, request fresh data from the canvas

      const eventDetail = { newView };

      // If the newView to be shown is the test detail page, pass the test object with the event
      if (newView === "test-detail") {
        eventDetail.test = test;
      }

      this.dispatchEvent(
        new CustomEvent("changeview", {
          detail: eventDetail,
          bubbles: true,
          composed: true,
        })
      );
    }

    private async _requestTests(testIds) {
      window.parent.postMessage(
        {
          pluginMessage: {
            type: "run-tests",
            data: { testIds },
          },
        },
        "*"
      );
      this._requestViewportZoom(testIds); // Zoom to test frames when tests are being run
    }

    private async _requestSaveNewSnapshots(testIds) {
      window.parent.postMessage(
        {
          pluginMessage: {
            type: "save-new-snapshots",
            data: { testIds },
          },
        },
        "*"
      );
    }

    private _requestViewportZoom(testIds, select = false) {
      window.parent.postMessage(
        {
          pluginMessage: {
            type: "zoom-viewport",
            data: { nodeIds: testIds, select },
          },
        },
        "*"
      );
    }
  };
