import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { MendelsohnMixins } from "./mendelsohn-mixins";
import "./m-button";
import { MendelsohnIcons } from "../MendelsohnIcons";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { LanguageConstants } from "../LanguageConstants";

@customElement("create-tests")
class CreateTests extends MendelsohnMixins(LitElement) {
  static styles = css`
    * {
      font-family: "Inter", sans-serif;
      font-size: 12px;
      box-sizing: border-box;
    }

    ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    li {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
    }

    .snapshot-list-header {
      display: flex;
      justify-content: space-between;
    }

    .create-tests-header {
      padding: 0 12px;
      display: flex;
      align-items: center;
      border-bottom: solid 1px #e6e6e6;
    }

    .create-tests-header h1 {
      margin: 0;
      padding: 12px 0;
    }

    .back-button {
      margin-right: 12px;
    }

    .create-tests-body {
      padding: 12px;
      flex: 1 1 auto;
    }

    .create-tests-body p {
      margin: 0;
    }

    .create-tests {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    .footer {
      margin-top: auto;
      display: flex;
      padding: 12px;
      align-items: center;
      justify-content: space-between;
    }

    .footer button {
      background: none;
      padding: 7px 12px;
      border: solid 1px #000000;
      border-radius: 6px;
      display: flex;
      align-items: center;
      margin-right: 4px;
      cursor: pointer;
      min-height: 30px;
      color: black;
    }

    .footer button svg {
      fill: currentColor;
      margin-right: 4px;
    }

    .footer button.primary {
      background: #18a0fb;
      border: 0;
      color: white;
    }

    m-button {
      min-height: 30px;
    }
  `;

  @property({ type: Array })
  currentselection = [];

  @property({ type: Boolean })
  pagehastests = false;

  get createableSnapshots() {
    return this.currentselection;
  }

  render() {
    const itemPlural = this.currentselection.length === 1 ? "item" : "items";

    const creatableSnapshotCount = this.createableSnapshots.length;

    const actionText = `Add ${creatableSnapshotCount} ${
      creatableSnapshotCount === 1 ? "snapshot" : "snapshots"
    }`;

    return html`<div class="create-tests">
      <div class="create-tests-header">
        ${this.pagehastests === true
          ? html`<m-button
                class="back-button"
                @click=${() => {
                  this._changeView("test-list");
                }}
                >${unsafeSVG(MendelsohnIcons.back)}</m-button
              >
              <h1>New Snapshots</h1>`
          : ""}
      </div>
      <div class="create-tests-body">
        <p>${LanguageConstants.NEW_SNAPSHOT_INSTRUCTIONS}</p>
        ${this.currentselection.length > 0
          ? html` <p>${this.currentselection.length} selected ${itemPlural}</p>`
          : ""}
      </div>
      <div class="footer">
        <m-button variant="link"> Take a tour </m-button>
        ${this.currentselection.length > 0
          ? html` <button
              @click=${this._createTestsFromSelection}
              class="primary"
            >
              ${actionText}
            </button>`
          : ""}
      </div>
    </div>`;
  }

  private _createTestsFromSelection(e: Event) {
    window.parent.postMessage(
      {
        pluginMessage: {
          type: "create-tests-from-current-selection",
        },
      },
      "*"
    );
  }
}
