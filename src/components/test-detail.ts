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
  status: string;

  @property()
  createdat: string;

  @property()
  lastrunat: string;

  @property({ type: String })
  diffdisplaymode = "overlay";

  renderDiffControls() {
    return html`
      <form id="display-mode-form">
        <fieldset>
          <legend>Display</legend>
          <label
            ><input
              type="radio"
              name="diff-mode"
              value="overlay"
              ?checked=${this.diffdisplaymode === "overlay"}
            />
            Overlay
          </label>
          <label
            ><input
              type="radio"
              name="diff-mode"
              value="side"
              ?checked=${this.diffdisplaymode === "side"}
            />
            Side-by-side
          </label>
        </fieldset>
        ${this.diffdisplaymode === "overlay"
          ? html`<label for="proportion-slider">Proportion</label>
              <input type="range" id="proportion-slider" /> `
          : ""}
      </form>
      <form id="update-snapshot-form">
        <button type="button">Save new snapshot</button>
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
      <h2>${dateLabel}: ${dateValue}</h2>
      <h2>Result: ${resultText}</h2>
      ${this.status === "fail" ? this.renderDiffControls() : ""}`;
  }
}
