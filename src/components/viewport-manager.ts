import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import "./test-list";
import "./test-detail";
import "./create-tests";

@customElement("viewport-manager")
class ViewportManager extends LitElement {
  @property()
  view: string = "create-tests";

  @property({ type: Boolean })
  pagehastests: boolean = false;

  @property({ type: Array })
  currentselection = [];

  @property({ type: Array })
  testgroupframes = [];

  @property({ type: Object })
  activetestwrapper = {};

  @property({ type: String })
  currentpageid;

  render() {
    let viewOutput;

    console.log(this.activetestwrapper);

    switch (this.view) {
      case "create-tests":
        viewOutput = html`<create-tests
          currentselection=${JSON.stringify(this.currentselection)}
          ?pagehastests=${this.pagehastests}
        ></create-tests>`;
        break;
      case "test-list":
        viewOutput = html` <test-list
          currentselection=${JSON.stringify(this.currentselection)}
          testgroupframes=${JSON.stringify(this.testgroupframes)}
          ?pagehastests=${this.pagehastests}
          currentpageid=${this.currentpageid}
        ></test-list>`;
        break;
      case "test-detail":
        viewOutput = html`<test-detail
          name=${this.activetestwrapper.name}
          id=${this.activetestwrapper.id}
          status=${this.activetestwrapper.status}
          createdat=${this.activetestwrapper.createdAt}
          lastrunat=${this.activetestwrapper.lastRunAt}
          viewproportion=${this.activetestwrapper.viewProportion}
          originnodeid=${this.activetestwrapper.originNodeId}
        ></test-detail>`;
        break;
      case "tutorial":
        viewOutput = html` <div>
          <h1>Tutorial</h1>
          <button @click="${this._changeView}" data-view="test-list">
            Show Create Tests
          </button>
        </div>`;
        break;
    }
    return html`
      <div
        @changeview=${this._changeViewListener}
        @postmessage=${this._handlePostMessage}
      >
        ${viewOutput}
      </div>
    `;
  }

  private _changeView(e: Event) {
    const newView = e.target.dataset.view;
    this.view = newView;
  }

  private _changeViewListener(e: CustomEvent) {
    const newView = e.detail.newView;
    if (newView === "test-detail") {
      this.activetestwrapper.id = e.detail.test.id; // Brittle & weird, have to set this so the switch statement in ui-scripts.js will update the test data
      window.parent.postMessage(
        {
          pluginMessage: {
            type: "request-test-detail-data",
            data: { testFrameId: e.detail.test.id },
          },
        },
        "*"
      );
    }
    this.view = newView;
  }

  private _handlePostMessage(e: CustomEvent) {
    window.parent.postMessage(
      {
        pluginMessage: e.detail,
      },
      "*"
    );
  }
}
