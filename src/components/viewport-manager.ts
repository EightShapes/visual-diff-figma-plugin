import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import "./test-list";

@customElement("viewport-manager")
class ViewportManager extends LitElement {
  @property()
  view: string = "test-list";

  @property({ type: Array })
  currentselection = [];

  @property({ type: Array })
  baselineframes = [];

  @property({ type: Array })
  testgroupframes = [];

  render() {
    let viewOutput;

    switch (this.view) {
      case "test-list":
        viewOutput = html` <test-list
          currentselection=${JSON.stringify(this.currentselection)}
          baselineframes=${JSON.stringify(this.baselineframes)}
          testgroupframes=${JSON.stringify(this.testgroupframes)}
        ></test-list>`;
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
