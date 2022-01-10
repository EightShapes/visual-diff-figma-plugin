import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { MendelsohnMixins } from "./mendelsohn-mixins";
import "./m-button";
import { MendelsohnIcons } from "../MendelsohnIcons";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";

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
    }

    .create-tests-body p {
      margin: 0;
    }
  `;

  @property({ type: Array })
  currentselection = [];

  @property({ type: Boolean })
  pagehastests = false;

  render() {
    const itemPlural = this.currentselection.length === 1 ? "item" : "items";
    const actionText =
      this.pagehastests === true
        ? "Add to snapshots on this page"
        : "Create new snapshots";
    return html` <div class="create-tests-header">
        ${this.pagehastests === true
          ? html`<m-button
              class="back-button"
              @click=${() => {
                this._changeView("test-list");
              }}
              >${unsafeSVG(MendelsohnIcons.back)}</m-button
            >`
          : ""}
        <h1>Create snapshots</h1>
      </div>
      <div class="create-tests-body">
        ${this.currentselection.length === 0
          ? html`<p>Select one or more objects to create a snapshot test.</p>`
          : ""}
        <!-- something selected state-->
        <div>
          <!-- List of selected objects, scrollable?, hiding for now, jsut showing count -->
          <!-- <ul>
          ${this.currentselection.map(
            (fNode) => html`<li>${fNode.name} -${fNode.id}</li>`
          )}
          </ul> -->
          <!-- List of actions to take -->
          ${this.currentselection.length > 0
            ? html` <p>
                  ${this.currentselection.length} selected ${itemPlural}
                </p>
                <ul>
                  <li>
                    <m-button
                      @click=${this._createTestsFromSelection}
                      variant="link"
                    >
                      ${actionText}
                    </m-button>
                  </li>
                </ul>`
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
