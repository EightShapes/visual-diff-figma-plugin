import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import "./m-button";

@customElement("test-list")
class TestList extends LitElement {
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
  `;

  @property({ type: Array })
  baselineframes = [];

  @property({ type: Array })
  currentselection = [];

  renderEmptyState() {
    return html`<!-- Nothing selected -->
      <p>Select one or more objects to create a test.</p>
      <!-- something selected state-->
      <div>
        <!-- List of selected objects, scrollable? -->
        <ul>
          ${this.currentselection.map(
            (fNode) => html`<li>${fNode.name} -${fNode.id}</li>`
          )}
        </ul>
        <!-- List of actions to take -->
        ${this.currentselection.length > 0
          ? html` <ul>
              <li>
                <button @click=${this._createTestsFromSelection}>
                  Create tests from selection
                </button>
              </li>
            </ul>`
          : ""}
      </div>`;
  }

  renderList() {
    return html`
      <h1>Tests</h1>
      <ul>
        ${this.baselineframes.map(
          (fNode) => html` <li>
            <span>${fNode.name}</span>
            <m-button
              @click=${this._requestTest}
              data-baselineframeid=${fNode.id}
              data-originnodeid=${fNode.originNodeId}
              >▶️</m-button
            >
          </li>`
        )}
      </ul>
    `;
  }

  render() {
    return html`<div>
      ${this.baselineframes.length === 0
        ? this.renderEmptyState()
        : this.renderList()}
      <button @click="${this._changeView}" data-view="tutorial">
        Show Tutorial
      </button>
    </div> `;
  }

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

  private _requestTest(e: Event) {
    console.log("REQUEST TEST");
    const baselineFrameId = e.target.dataset.baselineframeid;
    const originNodeId = e.target.dataset.originnodeid;
    window.parent.postMessage(
      {
        pluginMessage: {
          type: "create-test",
          data: { baselineFrameId, originNodeId },
        },
      },
      "*"
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
