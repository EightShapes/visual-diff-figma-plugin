import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { MendelsohnMixins } from "./mendelsohn-mixins";
import "./m-button";

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
      <form id="update-snapshot-form">
        <button type="button" @click=${this._handleSaveNewSnapshot}>
          Save new snapshot
        </button>
      </form>
    `;
  }

  render() {
    let resultText;
    switch (this.status) {
      case "pass":
        resultText = "No difference detected";
        break;
      case "fail":
        resultText = "⚠️ Differences detected";
        break;
      default:
        resultText = "No comparison run";
    }

    const dateLabel = this.status.length === 0 ? "Created" : "Compared";
    const dateValue =
      this.status.length === 0 ? this.createdat : this.lastrunat;

    return html`<m-button @click=${this._changeView} data-view="test-list"
        >Back</m-button
      >
      <h1>${this.name}</h1>
      <m-button
        @click=${() => {
          this._requestTests([this.id]);
        }}
        >▶️</m-button
      >
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
      <h2>${dateLabel}: ${dateValue}</h2>
      <h2>Result: ${resultText}</h2>
      ${this.status === "fail" ? this.renderDiffControls() : ""}`;
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
