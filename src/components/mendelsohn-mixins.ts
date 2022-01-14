export const MendelsohnMixins = (superClass) =>
  class extends superClass {
    /* class fields & methods to extend superClass with */
    private _changeView(newView) {
      this.dispatchEvent(
        new CustomEvent("changeview", {
          detail: { newView },
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
      console.log("SAVE A NEW SNAPSHOT REQUEST!");
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
