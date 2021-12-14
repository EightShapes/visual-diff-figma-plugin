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

    .snapshot-list-header {
      display: flex;
      justify-content: space-between;
    }
  `;

  @property({ type: Array })
  currentselection = [];

  @property({ type: Array })
  testgroupframes = [];

  @property({ type: Boolean })
  pagehastests = false;

  @property({ type: String })
  currentpageid;

  renderEmptyState() {
    const itemPlural = this.currentselection.length === 1 ? "item" : "items";
    const actionText =
      this.pagehastests === true
        ? "Add to snapshots on this page"
        : "Create new snapshots";
    return html`<!-- Nothing selected -->
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

  renderList() {
    // console.log(this.testgroupframes);
    const currentPage = this.testgroupframes.find((tgf) => {
      return tgf.pageId === this.currentpageid;
    });

    return html`
      <div class="snapshot-list-header">
        <h1>Snapshots</h1>
        <div class="header-actions">
          <m-button>New</m-button>
          <m-button>▶️ Run All</m-button>
        </div>
      </div>
      <ul>
        ${currentPage.tests.map(
          (test) => html` <li>
            <m-button
              variant="link"
              @click=${() => {
                this._requestViewportZoom(test.id);
              }}
              >${test.name}</m-button
            >
            <m-button
              @click=${() => {
                this._requestTest(test.id);
                this._requestViewportZoom(test.id);
              }}
              >▶️</m-button
            >
          </li>`
        )}
      </ul>
    `;
  }

  render() {
    return html`<div>
      ${this.pagehastests ? this.renderList() : this.renderEmptyState()}
      <!-- <button @click="${this._changeView}" data-view="tutorial">
        Show Tutorial
      </button> -->
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

  private _requestTest(testId) {
    window.parent.postMessage(
      {
        pluginMessage: {
          type: "run-tests",
          data: { testIds: [testId] },
        },
      },
      "*"
    );
  }

  private _requestViewportZoom(testId) {
    window.parent.postMessage(
      {
        pluginMessage: {
          type: "zoom-viewport",
          data: { nodeIds: [testId] },
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
