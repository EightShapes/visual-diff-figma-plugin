import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import "./test-list";
import "./test-detail";

@customElement("viewport-manager")
class ViewportManager extends LitElement {
  @property()
  view: string = "test-list";

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

    switch (this.view) {
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
    console.log("ive done a thing", e);
    const newView = e.detail.newView;
    this.view = newView;
  }

  private _handlePostMessage(e: CustomEvent) {
    console.log("HTPM", e, this);
    window.parent.postMessage(
      {
        pluginMessage: e.detail,
      },
      "*"
    );
  }
}