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

    private _requestViewportZoom(testIds) {
      window.parent.postMessage(
        {
          pluginMessage: {
            type: "zoom-viewport",
            data: { nodeIds: testIds },
          },
        },
        "*"
      );
    }
  };
