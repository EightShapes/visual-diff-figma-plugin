import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import "./m-button";

@customElement("create-tests")
class CreateTests extends LitElement {
  static styles = css`
    * {
      font-family: "Inter", sans-serif;
      font-size: 12px;
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
    return html`<!-- Nothing selected -->
      <m-button @click=${this._changeView} data-view="test-list">Back</m-button>
      <h1>Create snapshots</h1>
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
          ? html` <p>${this.currentselection.length} selected ${itemPlural}</p>
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
      </div>`;
  }

  // TODO, find a way to share this method across components or build into button
  private _changeView(e: Event) {
    const target = e.target;
    const newView = target.dataset.view;
    this.dispatchEvent(
      new CustomEvent("changeview", {
        detail: { newView },
        bubbles: true,
        composed: true,
      })
    );
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
