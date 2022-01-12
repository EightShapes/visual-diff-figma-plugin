import { LitElement, html, css, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import { MendelsohnMixins } from "./mendelsohn-mixins";
import "./m-button";
import { MendelsohnIcons } from "../MendelsohnIcons";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { LanguageConstants } from "../LanguageConstants";
import { MendelsohnConstants } from "../MendelsohnConstants";
import { time } from "console";

@customElement("create-tests")
class CreateTests extends MendelsohnMixins(LitElement) {
  static styles = css`
    * {
      font-family: "Inter", sans-serif;
      font-size: ${unsafeCSS(MendelsohnConstants.DEFAULT_FONT_SIZE)};
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
      margin: 0 0 24px;
      line-height: ${unsafeCSS(MendelsohnConstants.DEFAULT_LINE_HEIGHT)};
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

    .existing-snapshot-nodes-label,
    .oversized-nodes-label {
      color: ${unsafeCSS(MendelsohnConstants.ERROR_COLOR_HEX)};
      display: block;
    }

    .nodes-count {
      font-weight: bold;
    }

    .oversized-nodes-helper-text {
      color: ${unsafeCSS(MendelsohnConstants.SECONDARY_TEXT_COLOR_HEX)};
    }
  `;

  @property({ type: Array })
  testgroupframes = [];

  @property({ type: Array })
  currentselection = [];

  @property({ type: Boolean })
  pagehastests = false;

  @property({ type: String })
  currentpageid;

  get currentPageTests() {
    let tests = [];
    const currentPageData = this.testgroupframes.find((tgf) => {
      return tgf.pageId === this.currentpageid;
    });

    if (currentPageData !== undefined) {
      tests = currentPageData.tests;
    }

    return tests;
  }

  get currentPageTestNodeIds() {
    return this.currentPageTests.map((t) => t.originNodeId);
  }

  get existingSnapshotNodes() {
    return this.currentselection.filter((n) =>
      this.currentPageTestNodeIds.includes(n.id)
    );
  }

  get nodesWithoutExistingSnapshot() {
    return this.currentselection.filter(
      (n) => !this.currentPageTestNodeIds.includes(n.id)
    );
  }

  get oversizedNodes() {
    const nodes = this.nodesWithoutExistingSnapshot.filter((n) => {
      return n.height > 4096 || n.width > 4096;
    });
    return nodes;
  }

  get snapshotableNodes() {
    const nodes = this.nodesWithoutExistingSnapshot.filter((n) => {
      return n.height < 4096 && n.width < 4096;
    });
    return nodes;
  }

  render() {
    const itemPlural = this.currentselection.length === 1 ? "item" : "items";

    const snapshotableNodeCount = this.snapshotableNodes.length;

    const actionText = `Add ${snapshotableNodeCount} ${
      snapshotableNodeCount === 1 ? "snapshot" : "snapshots"
    }`;

    const oversizedNodesText = `selected ${
      this.oversizedNodes.length === 1 ? "item is" : "items are"
    } too large`;

    const existingSnapshotNodesText = `selected ${
      this.existingSnapshotNodes.length === 1
        ? "item already has a snapshot"
        : "items already have snapshots"
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
          ? html` <p>
              <span class="nodes-count">${this.currentselection.length}</span>
              selected ${itemPlural}
            </p>`
          : ""}
        ${this.oversizedNodes.length > 0
          ? html`<p class="oversized-nodes">
              <span class="oversized-nodes-label">
                <span class="nodes-count">${this.oversizedNodes.length}</span>
                ${oversizedNodesText}
              </span>
              <span class="oversized-nodes-helper-text">
                Snapshot height and width must not exceed 4096px.
              </span>
            </p>`
          : ""}
        ${this.existingSnapshotNodes.length > 0
          ? html`<p class="existing-snapshot-nodes">
              <span class="existing-snapshot-nodes-label">
                <span class="nodes-count"
                  >${this.existingSnapshotNodes.length}</span
                >
                ${existingSnapshotNodesText}
              </span>
            </p>`
          : ""}
      </div>
      <div class="footer">
        <m-button variant="link"> Take a tour </m-button>
        ${snapshotableNodeCount > 0
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
          type: "create-tests-for-nodes",
          data: {
            nodeIds: this.snapshotableNodes.map((n) => n.id),
          },
        },
      },
      "*"
    );
  }
}
