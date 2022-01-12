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

    :host {
      flex: 0 1 100%;
    }

    .test-list {
      height: 100vh;
      display: flex;
      flex-direction: column;
      width: 100%;
    }

    ul {
      list-style: none;
      margin: 0;
      padding: 0;
      text-align: left;
      overflow-y: scroll;
      flex: 1 1 100%;
    }

    li {
      display: flex;
      justify-content: space-between;
      padding: 12px;
    }

    li:hover {
      background: #daebf7;
    }

    .snapshot-list-footer {
      display: flex;
      justify-content: space-between;
      border-top: solid 1px #e6e6e6;
      padding: 8px 12px;
      align-items: center;
      margin-top: auto;
      flex: 0 0 auto;
    }

    .footer-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }

    .footer-actions button {
      background: none;
      padding: 7px 12px;
      border: solid 1px #000000;
      border-radius: 6px;
      display: flex;
      align-items: center;
      margin-right: 4px;
      cursor: pointer;
      min-height: 30px;
    }

    .footer-actions button svg {
      fill: currentColor;
      margin-right: 4px;
    }

    .footer-actions button.primary {
      background: #18a0fb;
      border: 0;
      color: white;
    }

    .footer-actions button:last-child {
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
        <ul>
          ${currentPage.tests.map((test) => {
            let statusIcon;
            switch (test.status) {
              case "pass":
                statusIcon = html`${unsafeSVG(MendelsohnIcons.check)}`;
                break;
              case MendelsohnConstants.STATUS_TEST_TOO_LARGE:
              case MendelsohnConstants.STATUS_BASELINE_TOO_LARGE:
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
        <div class="snapshot-list-footer">
          <div class="footer-actions">
            <button
              @click=${() => {
                this._changeView("create-tests");
              }}
            >
              New
            </button>
            <button
              class="primary"
              @click=${() => {
                this._requestTests(allTestIds);
              }}
            >
              ${unsafeSVG(MendelsohnIcons.play)}&nbsp;Compare All
            </button>
          </div>
        </div>
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
