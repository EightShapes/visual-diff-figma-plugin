import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { MendelsohnMixins } from "./mendelsohn-mixins";
import "./m-button";
import { MendelsohnConstants } from "../MendelsohnConstants";
import { MendelsohnIcons } from "../MendelsohnIcons";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";

@customElement("test-list")
class TestList extends MendelsohnMixins(LitElement) {
  static styles = css`
    * {
      font-family: "Inter", sans-serif;
      font-size: 12px;
      box-sizing: border-box;
    }

    ul {
      list-style: none;
      margin: 0;
      padding: 12px 0;
      text-align: left;
    }

    li {
      display: flex;
      justify-content: space-between;
      padding: 8px;
    }

    li:hover {
      background: #daebf7;
    }

    .snapshot-list-header {
      display: flex;
      justify-content: space-between;
      border-bottom: solid 1px #e6e6e6;
      padding: 8px 12px;
      align-items: center;
    }

    .snapshot-list-header h1 {
      margin: 0;
    }

    .header-actions {
      display: flex;
      align-items: center;
    }

    .header-actions button {
      background: none;
      padding: 7px 12px;
      border: solid 1px #000000;
      border-radius: 6px;
      display: flex;
      align-items: center;
      margin-right: 4px;
      cursor: pointer;
    }

    .header-actions button:last-child {
      margin-right: 0;
    }

    .status-and-name {
      display: flex;
      align-items: baseline;
      padding-right: 4px;
    }

    .status-icon {
      margin-right: 8px;
      width: 16px;
      flex-shrink: 0;
      text-align: center;
    }

    .actions {
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }

    .actions > * {
      margin-right: 12px;
    }

    .actions > *:last-child {
      margin-right: 0;
    }
  `;

  @property({ type: Array })
  testgroupframes = [];

  @property({ type: String })
  currentpageid;

  render() {
    const currentPage = this.testgroupframes.find((tgf) => {
      return tgf.pageId === this.currentpageid;
    });
    const allTestIds = currentPage.tests.map((t) => t.id);

    return html`
      <div class="test-list">
        <div class="snapshot-list-header">
          <h1>Snapshots</h1>
          <div class="header-actions">
            <button
              @click=${() => {
                this._changeView("create-tests");
              }}
            >
              New
            </button>
            <button
              @click=${() => {
                this._requestTests(allTestIds);
              }}
            >
              ${unsafeSVG(MendelsohnIcons.play)}&nbsp;Run All
            </button>
          </div>
        </div>
        <ul>
          ${currentPage.tests.map((test) => {
            let statusIcon;
            switch (test.status) {
              case "pass":
                statusIcon = html`${unsafeSVG(MendelsohnIcons.check)}`;
                break;
              case MendelsohnConstants.TEST_TOO_LARGE:
              case MendelsohnConstants.BASELINE_TOO_LARGE:
              case "fail":
                statusIcon = html`${unsafeSVG(MendelsohnIcons.warning)}`;
                break;
              default:
                statusIcon = "-";
            }

            return html` <li>
              <span class="status-and-name">
                <span class="status-icon"> ${statusIcon} </span>
                <m-button
                  variant="link"
                  @click=${() => {
                    this._showTestDetail(test);
                    this._requestViewportZoom([test.id]);
                  }}
                  >${test.name}</m-button
                >
              </span>
              <span class="actions">
                <m-button
                  @click=${() => {
                    this._requestTests([test.id]);
                  }}
                  >${unsafeSVG(MendelsohnIcons.play)}</m-button
                >
                <m-button
                  @click=${() => {
                    this._requestViewportZoom([test.id]);
                  }}
                  >${unsafeSVG(MendelsohnIcons.locate)}</m-button
                >
              </span>
            </li>`;
          })}
        </ul>
      </div>
    `;
  }

  private _showTestDetail(test) {
    this.dispatchEvent(
      new CustomEvent("changeview", {
        detail: { newView: "test-detail", test },
        bubbles: true,
        composed: true,
      })
    );
  }
}
