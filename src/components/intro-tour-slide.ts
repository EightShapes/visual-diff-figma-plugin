import { LitElement, html, css, unsafeCSS } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { MendelsohnMixins } from "./mendelsohn-mixins";
import "./m-button";
import { MendelsohnConstants } from "../MendelsohnConstants";
import { MendelsohnIcons } from "../MendelsohnIcons";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";

@customElement("intro-tour-slide")
class IntroTour extends MendelsohnMixins(LitElement) {
  static styles = css`
    * {
      font-family: "Inter", sans-serif;
      font-size: ${unsafeCSS(MendelsohnConstants.DEFAULT_FONT_SIZE)};
      box-sizing: border-box;
      line-height: ${unsafeCSS(MendelsohnConstants.DEFAULT_LINE_HEIGHT)};
    }

    :host {
      flex: 0 1 100%;
    }

    .intro-tour-slide {
      display: none;
    }

    .intro-tour-slide.visible {
      display: flex;
      flex-direction: column;
      flex: 1 1 auto;
      height: 100%;
      align-items: flex-start;
    }

    img {
      height: 125px;
      width: 100%;
      max-width: 100%;
      object-fit: cover;
    }

    h2 {
      padding: 12px;
      margin: 0;
    }

    p {
      padding: 0 12px;
      margin: 0;
    }

    .image-wrapper {
      position: relative;
      width: 100%;
    }

    .last-slide-button {
      background: ${unsafeCSS(MendelsohnConstants.PRIMARY_CTA_HEX)};
      padding: 7px 12px;
      border: 0;
      color: white;
      border-radius: 6px;
      display: inline-flex;
      align-items: center;
      margin-right: 4px;
      cursor: pointer;
      min-height: 30px;
      margin-left: 12px;
      margin-top: auto;
    }

    .skip-tour-button {
      background: transparent;
      border: 0;
      color: ${unsafeCSS(MendelsohnConstants.PRIMARY_CTA_HEX)};
      cursor: pointer;
      margin-top: auto;
      margin-left: auto;
      margin-right: 12px;
    }
  `;

  @property()
  imgsrc = MendelsohnConstants.TOUR_IMAGES.STEP_1;

  @property()
  title = "Slide Title";

  @property()
  copy = "Lorem ipsum dolor sanctum filler filler filler.";

  @property({ type: Boolean })
  visible = false;

  @property({ type: Boolean })
  lastslide = false;

  render() {
    return html`
      <div class="intro-tour-slide ${this.visible ? "visible" : ""}">
        <div class="image-wrapper">
          <img src="${this.imgsrc}" alt="${this.title} Illustration" />
        </div>
        <h2>${this.title}</h2>

        <p>${unsafeHTML(this.copy)}</p>

        ${this.lastslide
          ? html`<button
              class="last-slide-button"
              @click=${() => {
                this._changeView("create-tests");
              }}
            >
              Get Started
            </button>`
          : html`<button
              class="skip-tour-button"
              @click=${() => {
                this._changeView("create-tests");
              }}
            >
              Skip tour
            </button>`}
      </div>
    `;
  }
}
