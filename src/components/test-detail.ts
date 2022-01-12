import { LitElement, html, css, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import { MendelsohnMixins } from "./mendelsohn-mixins";
import { LanguageConstants } from "../LanguageConstants";
import "./m-button";
import { MendelsohnConstants } from "../MendelsohnConstants";
import { MendelsohnIcons } from "../MendelsohnIcons";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";

@customElement("test-detail")
class TestDetail extends MendelsohnMixins(LitElement) {
  static styles = css`
    * {
      font-family: "Inter", sans-serif;
      font-size: ${unsafeCSS(MendelsohnConstants.DEFAULT_FONT_SIZE)};
      box-sizing: border-box;
    }

    .test-detail {
      display: flex;
      flex-direction: column;
      height: 100vh;
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
      font-weight: bold;
      flex-grow: 1;
      padding: 12px 12px 12px 0;
      margin: 0;
    }

    .test-detail-header {
      align-items: center;
      display: flex;
      padding: 0 12px;
      border-bottom: solid 1px #e6e6e6;
    }

    .test-detail-header > * {
      margin-right: 12px;
    }

    .test-detail-header > *:last-child {
      margin-right: 0;
    }

    .test-results {
      padding: 0 12px;
    }

    h2 {
      align-items: center;
      font-weight: normal;
      display: flex;
    }

    .test-results h2 {
      margin: 0;
      padding: 12px 0;
    }

    .result-label {
      font-weight: bold;
      width: 80px;
    }

    .status-text {
      display: inline-flex;
      align-items: center;
    }

    .status-text svg {
      margin-right: 8px;
      fill: currentColor;
    }

    .pass.status-text svg {
      fill: ${unsafeCSS(MendelsohnConstants.NODIFF_COLOR_HEX)};
    }

    .fail.status-text {
      color: ${unsafeCSS(MendelsohnConstants.DIFF_COLOR_HEX)};
    }

    .origin-node-missing.status-text,
    .baseline-too-large.status-text,
    .test-too-large.status-text {
      color: ${unsafeCSS(MendelsohnConstants.ERROR_COLOR_HEX)};
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
      padding: 12px;
    }

    .update-snapshot-form {
      display: block;
      padding: 0;
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

    .body {
      flex: 1 1 auto;
      height: 100%;
    }

    p {
      margin: 0 0 12px;
    }

    .footer {
      margin-top: auto;
    }

    .footer-bottom {
      border-top: solid 1px #e6e6e6;
      padding: 12px;
    }

    .footer-top {
      padding: 12px;
      display: flex;
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

    input[type="range"] {
      -webkit-appearance: none; /* Hides the slider so that custom slider can be made */
      width: 100%; /* Specific width is required for Firefox. */
      background: transparent; /* Otherwise white in Chrome */
      margin: 0;
    }

    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
    }

    input[type="range"]:focus {
      outline: none; /* Removes the blue border. You should probably do some kind of focus styling for accessibility reasons though. */
    }

    input[type="range"]::-ms-track {
      width: 100%;
      cursor: pointer;

      /* Hides the slider so custom styles can be added */
      background: transparent;
      border-color: transparent;
      color: transparent;
    }

    /* Special styling for WebKit/Blink */
    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      height: 10px;
      width: 10px;
      border-radius: 20px;
      background: black;
      cursor: pointer;
    }

    /* All the same stuff for Firefox */
    input[type="range"]::-moz-range-thumb {
      height: 10px;
      width: 10px;
      border-radius: 20px;
      background: black;
      cursor: pointer;
    }

    /* All the same stuff for IE */
    input[type="range"]::-ms-thumb {
      height: 10px;
      width: 10px;
      border-radius: 20px;
      background: black;
      cursor: pointer;
    }

    input[type="range"]::-webkit-slider-runnable-track {
      width: 100%;
      height: 10px;
      cursor: pointer;
      background: transparent;
      border: 0;
    }

    input[type="range"]::-moz-range-track {
      width: 100%;
      height: 10px;
      cursor: pointer;
      background: transparent;
      border: 0;
    }

    input[type="range"]::-ms-track {
      width: 100%;
      height: 10px;
      cursor: pointer;
      background: transparent;
      border: 0;
    }

    .range-slider-wrap {
      position: relative;
      overflow: visible;
    }

    .range-slider-wrap::after {
      content: "";
      position: absolute;
      top: 5px;
      height: 1px;
      background: black;
      width: 100%;
      left: 0;
    }

    .range-slider-wrap-labels {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 4px;
    }

    .error-message {
      border-top: solid 1px #e6e6e6;
      display: block;
      color: ${unsafeCSS(MendelsohnConstants.ERROR_COLOR_HEX)};
      padding: 12px;
      line-height: 1.435454545454545;
    }

    .error-message strong {
      display: block;
      font-size: 11px;
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

  renderFooter() {
    const showSaveSnapshotForm =
      this.status === "fail" ||
      this.status === MendelsohnConstants.STATUS_BASELINE_TOO_LARGE;

    const showCompareButton =
      this.status !== MendelsohnConstants.STATUS_ORIGIN_NODE_MISSING &&
      this.status !== MendelsohnConstants.STATUS_BASELINE_TOO_LARGE &&
      !this.running;

    const showDeleteTestForm =
      this.status === MendelsohnConstants.STATUS_ORIGIN_NODE_MISSING;

    return html` <div class="footer">
      <div class="footer-top">
        ${showCompareButton
          ? html`<button
              @click=${() => {
                const event = new CustomEvent("test-run-requested", {
                  detail: { testId: this.id },
                  bubbles: true,
                  composed: true,
                });
                this.dispatchEvent(event); // This event is captures in ui-scripts.js and then a data change is updated to set the test running status to true
                this._requestTests([this.id]);
              }}
              title="Compare"
            >
              ${unsafeSVG(MendelsohnIcons.play)}
              ${this.status.length > 0 ? `Compare again` : "Compare"}
            </button>`
          : ""}
        ${showDeleteTestForm ? this.renderDeleteTestForm() : ""}
        ${showSaveSnapshotForm ? this.renderSaveNewSnapshotForm() : ""}
      </div>
      <div class="footer-bottom">
        <m-button
          @click=${() => {
            this._requestViewportZoom([this.originnodeid]);
          }}
          title="Go to original artwork"
          variant="link"
          >${LanguageConstants.GO_TO_ORIGINAL_ARTWORK_LABEL}</m-button
        >
      </div>
    </div>`;
  }

  renderDiffControls() {
    return html`
      <form class="display-mode-form" id="display-mode-form">
        <label class="result-label" for="proportion-slider">Highlight</label>
        <div class="range-slider-wrap">
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
          <div class="range-slider-wrap-labels">
            <span class="range-slider-wrap-min">0%</span>
            <span class="range-slider-wrap-max">100%</span>
          </div>
        </div>
      </form>
    `;
  }

  renderSaveNewSnapshotForm() {
    return this.status !== MendelsohnConstants.STATUS_BASELINE_TOO_LARGE
      ? html`<form class="update-snapshot-form" id="update-snapshot-form">
          <button
            class="primary"
            type="button"
            @click=${() => {
              this._requestSaveNewSnapshots([this.id]);
            }}
          >
            ${unsafeSVG(MendelsohnIcons.check)} Approve
          </button>
        </form>`
      : "";
  }

  renderDeleteTestForm() {
    return html`<form class="delete-test-form" id="delete-test-form">
      <button type="button" @click=${this._handleDeleteTest}>
        Delete snapshot
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
    let errorMessage;
    switch (this.status) {
      case "pass":
        resultText = html`${unsafeSVG(
          MendelsohnIcons.nodiff
        )}${LanguageConstants.PASS_STATUS_LABEL}`;
        break;
      case "fail":
        resultText = html`${unsafeSVG(MendelsohnIcons.diff)}
        ${LanguageConstants.FAIL_STATUS_LABEL}`;
        break;
      case MendelsohnConstants.STATUS_BASELINE_TOO_LARGE:
        resultText = html`${unsafeSVG(MendelsohnIcons.warning)}
        ${unsafeHTML(LanguageConstants.BASELINE_TOO_LARGE_STATUS_LABEL)}`;
        errorMessage =
          LanguageConstants.BASELINE_TOO_LARGE_STATUS_ERROR_MESSAGE;
        break;
      case MendelsohnConstants.STATUS_TEST_TOO_LARGE:
        resultText = html`${unsafeSVG(MendelsohnIcons.warning)}
        ${unsafeHTML(LanguageConstants.TEST_TOO_LARGE_STATUS_LABEL)}`;
        errorMessage = LanguageConstants.TEST_TOO_LARGE_STATUS_ERROR_MESSAGE;
        break;
      case MendelsohnConstants.STATUS_ORIGIN_NODE_MISSING:
        resultText = html`${unsafeSVG(MendelsohnIcons.warning)}
        ${unsafeHTML(LanguageConstants.STATUS_LABEL_ORIGIN_NODE_MISSING)}`;
        errorMessage = LanguageConstants.ERROR_MESSAGE_ORIGIN_NODE_MISSING;
        break;
      default:
        resultText = html`${unsafeSVG(MendelsohnIcons.nocomparison)}
        ${LanguageConstants.NO_COMPARISON_RUN_STATUS_LABEL}`;
    }

    const dateLabel = this.status.length === 0 ? "Created" : "Compared";
    const dateValue =
      this.status.length === 0 ? this.createdat : this.lastrunat;

    const showErrorMessage =
      this.status === MendelsohnConstants.STATUS_ORIGIN_NODE_MISSING ||
      this.status === MendelsohnConstants.STATUS_BASELINE_TOO_LARGE ||
      this.status === MendelsohnConstants.STATUS_TEST_TOO_LARGE;

    return html`
      <div class="test-results">
        <h2><span class="result-label">${dateLabel}</span> ${dateValue}</h2>
        <h2>
          <span class="result-label status-label">Status</span>
          <span class="status-text ${this.status}"> ${resultText} </span>
        </h2>
      </div>
      ${showErrorMessage
        ? html`<div class="error-message">${unsafeHTML(errorMessage)}</div>`
        : ""}
      ${this.status === "fail" ? this.renderDiffControls() : ""}
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
          <m-button
            @click=${() => {
              this._requestViewportZoom([this.id]);
            }}
            title="Go To Snapshot"
            >${unsafeSVG(MendelsohnIcons.locate)}</m-button
          >
        </div>
      </div>
      <div class="body">
        ${this.running
          ? this.renderTestRunningMessage()
          : this.renderTestResults()}
      </div>
      ${this.renderFooter()}
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

  private _handleDeleteTest(e) {
    window.parent.postMessage(
      {
        pluginMessage: {
          type: "delete-test",
          data: { testFrameId: this.id },
        },
      },
      "*"
    );
  }
}
