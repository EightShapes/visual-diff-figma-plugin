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
        ${currentPage.tests.map(
          (test) => html` <li>
            <m-button
              variant="link"
              @click=${() => {
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
          </li>`
        )}
      </ul>
    `;
  }

  private _changeView(e: Event) {
    const target = e.target;
    const newView = target.dataset.view;
    console.log(`go to new view ${newView}`);
    this.dispatchEvent(
      new CustomEvent("changeview", {
        detail: { newView },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _requestTests(testIds) {
    window.parent.postMessage(
      {
        pluginMessage: {
          type: "run-tests",
          data: { testIds },
        },
      },
      "*"
    );
    this._requestViewportZoom(testIds); // Zoom to test frames when tests are being run
  }

  private _requestViewportZoom(testIds) {
    window.parent.postMessage(
      {
        pluginMessage: {
          type: "zoom-viewport",
          data: { nodeIds: testIds },
        },
      },
      "*"
    );
  }
}
