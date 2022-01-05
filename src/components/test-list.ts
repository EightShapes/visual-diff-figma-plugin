import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { MendelsohnMixins } from "./mendelsohn-mixins";
import "./m-button";
import { MendelsohnConstants } from "../MendelsohnConstants";

@customElement("test-list")
class TestList extends MendelsohnMixins(LitElement) {
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
  testgroupframes = [];

  @property({ type: String })
  currentpageid;

  render() {
    const currentPage = this.testgroupframes.find((tgf) => {
      return tgf.pageId === this.currentpageid;
    });
    const allTestIds = currentPage.tests.map((t) => t.id);

    return html`
      <div class="snapshot-list-header">
        <h1>Snapshots</h1>
        <div class="header-actions">
          <m-button @click=${this._changeView} data-view="create-tests"
            >New</m-button
          >
          <m-button
            @click=${() => {
              this._requestTests(allTestIds);
            }}
            >▶️ Run All</m-button
          >
        </div>
      </div>
      <ul>
        ${currentPage.tests.map((test) => {
          let statusIcon;
          switch (test.status) {
            case "pass":
              statusIcon = "✅";
              break;
            case MendelsohnConstants.TEST_TOO_LARGE:
            case MendelsohnConstants.BASELINE_TOO_LARGE:
            case "fail":
              statusIcon = "⚠️";
              break;
            default:
              statusIcon = "-";
          }

          return html` <li>
            ${statusIcon}
            <m-button
              variant="link"
              @click=${() => {
                this._showTestDetail(test);
                this._requestViewportZoom([test.id]);
              }}
              >${test.name}</m-button
            >
            <m-button
              @click=${() => {
                this._requestTests([test.id]);
              }}
              >▶️</m-button
            >
            <m-button
              @click=${() => {
                this._requestViewportZoom([test.id]);
              }}
              >🎯</m-button
            >
          </li>`;
        })}
      </ul>
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
