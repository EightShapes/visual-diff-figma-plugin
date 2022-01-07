import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { MendelsohnMixins } from "./mendelsohn-mixins";
import { LanguageConstants } from "../LanguageConstants";
import "./m-button";
import { MendelsohnConstants } from "../MendelsohnConstants";
import { MendelsohnIcons } from "../MendelsohnIcons";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";

@customElement("test-detail")
class TestDetail extends MendelsohnMixins(LitElement) {
  static styles = css`
    * {
      font-family: "Inter", sans-serif;
      font-size: 12px;
      box-sizing: border-box;
    }

    .test-detail {
      display: flex;
      flex-direction: column;
    }

    .spinner {
      box-sizing: border-box;
      height: 37px;
      width: 37px;
      border: solid 4px #c4c4c4;
      border-radius: 100px;
      position: relative;
      animation: infinite linear 1s spin;
    }

    .spinner::after {
      content: "";
      height: 8px;
      width: 16px;
      position: absolute;
      background: #ffffff;
      right: -4px;
      top: 50%;
    }

    .spinner-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      flex-grow: 1;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .origin-name {
      font-weight: normal;
      flex-grow: 1;
    }

    .test-detail-header {
      align-items: center;
      display: flex;
      padding: 12px;
      border-bottom: solid 1px #e6e6e6;
    }

    .test-detail-header > * {
      margin-right: 12px;
    }

    .test-detail-header > *:last-child {
      margin-right: 0;
    }

    .test-results {
      padding: 12px;
    }

    h2 {
      align-items: center;
      font-weight: normal;
      display: flex;
    }

    .result-label {
      font-weight: bold;
      width: 80px;
    }

    .test-detail-actions {
      align-items: center;
      display: flex;
      flex-grow: 0;
    }

    .test-detail-actions > * {
      margin-right: 12px;
    }

    .test-detail-actions > *:last-child {
      margin-right: 0;
    }

    .display-mode-form {
      display: flex;
      align-items: flex-start;
      border-top: solid 1px #e6e6e6;
      padding: 12px;
    }

    .update-snapshot-form {
      display: block;
      padding: 12px;
      margin: 0;
    }

    .update-snapshot-form button {
      background: none;
      padding: 7px 12px;
      border: solid 1px #000000;
      border-radius: 6px;
      cursor: pointer;
    }

    .test-running-message {
      padding: 12px;
    }

    p {
      margin: 0 0 12px;
    }
  `;

  @property()
  name: string;

  @property()
  id: string;

  @property()
  originnodeid: string;

  @property()
  status: string;

  @property()
  createdat: string;

  @property()
  lastrunat: string;

  @property({ type: Number })
  viewproportion = 0.5;

  @property({ type: Boolean })
  running = false;

  constructor() {
    super();
    this.displayModeSliderDragging = false;
  }

  renderDiffControls() {
    return html`
      <form class="display-mode-form" id="display-mode-form">
        <label class="result-label" for="proportion-slider">Difference</label>
        <input
          type="range"
          id="proportion-slider"
          @mousedown=${this._initiateDisplayProportionChange}
          @mouseup=${this._terminateDisplayProportionChange}
          @mousemove=${this._handleDisplayProportionChange}
          min="0"
          max="1"
          step="0.05"
          value=${this.viewproportion}
        />
      </form>
    `;
  }

  renderSaveNewSnapshotForm() {
    return html` <form class="update-snapshot-form" id="update-snapshot-form">
      <button type="button" @click=${this._handleSaveNewSnapshot}>
        Save new snapshot
      </button>
    </form>`;
  }

  renderTestRunningMessage() {
    return html`
      <div class="test-running-message">
        <p>${LanguageConstants.TEST_IN_PROGRESS}</p>
        <div class="spinner-wrapper">
          <div class="spinner"></div>
        </div>
      </div>
    `;
  }

  renderTestResults() {
    let resultText;
    switch (this.status) {
      case "pass":
        resultText = LanguageConstants.PASS_STATUS_LABEL;
        break;
      case "fail":
        resultText = html`${unsafeSVG(MendelsohnIcons.warning)}
        ${LanguageConstants.FAIL_STATUS_LABEL}`;
        break;
      case MendelsohnConstants.BASELINE_TOO_LARGE:
        resultText = LanguageConstants.BASELINE_TOO_LARGE_STATUS_LABEL;
        break;
      case MendelsohnConstants.TEST_TOO_LARGE:
        resultText = LanguageConstants.TEST_TOO_LARGE_STATUS_LABEL;
        break;
      default:
        resultText = "No comparison run";
    }

    const dateLabel = this.status.length === 0 ? "Created" : "Compared";
    const dateValue =
      this.status.length === 0 ? this.createdat : this.lastrunat;

    const showDateStamp =
      this.status !== MendelsohnConstants.BASELINE_TOO_LARGE &&
      this.status !== MendelsohnConstants.TEST_TOO_LARGE;

    const showResultLabel =
      this.status !== MendelsohnConstants.BASELINE_TOO_LARGE &&
      this.status !== MendelsohnConstants.TEST_TOO_LARGE;

    const showSaveSnapshotForm =
      this.status === "fail" ||
      this.status === MendelsohnConstants.BASELINE_TOO_LARGE;

    return html`
      <div class="test-results">
        ${showDateStamp
          ? html`<h2>
              <span class="result-label">${dateLabel}</span> ${dateValue}
            </h2>`
          : ""}
        <h2>
          <span class="result-label">${showResultLabel ? "Result" : ""}</span>
          ${resultText}
        </h2>
      </div>
      ${this.status === "fail" ? this.renderDiffControls() : ""}
      ${showSaveSnapshotForm ? this.renderSaveNewSnapshotForm() : ""}
    `;
  }

  render() {
    return html` <div class="test-detail">
      <div class="test-detail-header">
        <m-button
          @click=${() => {
            this._changeView("test-list");
          }}
          data-view="test-list"
          title="Back to tests"
          >${unsafeSVG(MendelsohnIcons.back)}</m-button
        >
        <h1 class="origin-name">${this.name}</h1>
        <div class="test-detail-actions">
          ${this.status === MendelsohnConstants.BASELINE_TOO_LARGE ||
          this.running
            ? ""
            : html`<m-button
                @click=${() => {
                  const event = new CustomEvent("test-run-requested", {
                    detail: { testId: this.id },
                    bubbles: true,
                    composed: true,
                  });
                  this.dispatchEvent(event); // This event is captures in ui-scripts.js and then a data change is updated to set the test running status to true
                  this._requestTests([this.id]);
                }}
                title="Run Test"
                >${unsafeSVG(MendelsohnIcons.play)}</m-button
              >`}
          <m-button
            @click=${() => {
              this._requestViewportZoom([this.id]);
            }}
            title="Show Test"
            >${unsafeSVG(MendelsohnIcons.locate)}</m-button
          >
          <m-button
            @click=${() => {
              this._requestViewportZoom([this.originnodeid]);
            }}
            title="Go to origin"
            >${unsafeSVG(MendelsohnIcons.origin)}</m-button
          >
        </div>
      </div>
      ${this.running
        ? this.renderTestRunningMessage()
        : this.renderTestResults()}
    </div>`;
  }

  private _handleDisplayProportionChange(e) {
    if (this.displayModeSliderDragging) {
      window.parent.postMessage(
        {
          pluginMessage: {
            type: "display-mode-proportion-change",
            data: { testFrameId: this.id, proportion: e.target.value },
          },
        },
        "*"
      );
    }
  }

  private _initiateDisplayProportionChange(e) {
    this.displayModeSliderDragging = true;
  }

  private _terminateDisplayProportionChange(e) {
    this.displayModeSliderDragging = false;
  }

  private _handleSaveNewSnapshot(e) {
    window.parent.postMessage(
      {
        pluginMessage: {
          type: "save-new-snapshot",
          data: { testFrameId: this.id },
        },
      },
      "*"
    );
  }
}
