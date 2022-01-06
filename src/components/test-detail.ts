import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { MendelsohnMixins } from "./mendelsohn-mixins";
import { LanguageConstants } from "../LanguageConstants";
import "./m-button";
import { MendelsohnConstants } from "../MendelsohnConstants";

@customElement("test-detail")
class TestDetail extends MendelsohnMixins(LitElement) {
  static styles = css`
    * {
      font-family: "Inter", sans-serif;
      font-size: 12px;
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
      <form id="display-mode-form">
        <label for="proportion-slider">Difference</label>
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
    return html` <form id="update-snapshot-form">
      <button type="button" @click=${this._handleSaveNewSnapshot}>
        Save new snapshot
      </button>
    </form>`;
  }

  renderTestRunningMessage() {
    return html`
      <h2>${LanguageConstants.TEST_IN_PROGRESS}</h2>
      Spinner
    `;
  }

  renderTestResults() {
    let resultText;
    switch (this.status) {
      case "pass":
        resultText = LanguageConstants.PASS_STATUS_LABEL;
        break;
      case "fail":
        resultText = LanguageConstants.FAIL_STATUS_LABEL;
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
      ${showDateStamp ? html`<h2>${dateLabel}: ${dateValue}</h2>` : ""}
      <h2>${showResultLabel ? "Result:" : ""} ${resultText}</h2>
      ${this.status === "fail" ? this.renderDiffControls() : ""}
      ${showSaveSnapshotForm ? this.renderSaveNewSnapshotForm() : ""}
    `;
  }

  render() {
    return html`<m-button @click=${this._changeView} data-view="test-list"
        >Back</m-button
      >
      <h1>${this.name}</h1>
      ${this.status === MendelsohnConstants.BASELINE_TOO_LARGE || this.running
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
            >▶️</m-button
          >`}
      <m-button
        @click=${() => {
          this._requestViewportZoom([this.id]);
        }}
        >🎯</m-button
      >
      <m-button
        @click=${() => {
          this._requestViewportZoom([this.originnodeid]);
        }}
        >Go to origin</m-button
      >
      ${this.running
        ? this.renderTestRunningMessage()
        : this.renderTestResults()}`;
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
