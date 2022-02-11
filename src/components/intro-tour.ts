import { LitElement, html, css, unsafeCSS } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { MendelsohnMixins } from "./mendelsohn-mixins";
import "./intro-tour-slide";
import { MendelsohnConstants } from "../MendelsohnConstants";
import { MendelsohnIcons } from "../MendelsohnIcons";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";

@customElement("intro-tour")
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

    .intro-tour {
      display: flex;
      height: 100vh;
      flex-direction: column;
    }

    .slide-controls {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: auto;
      padding: 12px;
    }

    .slide-wrapper {
      position: relative;
      flex: 1 0 auto;
    }

    .slide-controls-indicator {
      align-items: center;
      display: flex;
      justify-content: space-between;
      flex: 0 1 72px;
    }

    .slide-controls-index-indicator {
      border-radius: 8px;
      background: #c5c5c5;
      height: 8px;
      width: 8px;
    }

    .slide-controls-index-indicator.active {
      background: ${unsafeCSS(MendelsohnConstants.PRIMARY_CTA_HEX)};
    }

    .icon-button {
      background: transparent;
      border: 0;
      cursor: pointer;
      visibility: hidden;
      position: relative;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .icon-button .button-text {
      position: absolute;
      left: -1000px;
    }

    .icon-button:last-child {
      padding-right: 0;
    }

    .icon-button:first-child {
      padding-left: 0;
    }

    .icon-button.visible {
      visibility: visible;
    }
  `;

  @state()
  currentslide = 0;

  constructor() {
    super();
    this.slideContent = [
      {
        title: "Create snapshots",
        copy: "Select one or more objects to create snapshots images you’ll to compare differences against later.",
        imgsrc: "http://www.fillmurray.com/g/200/300",
      },
      {
        title: "Continue your work",
        copy: "Edit your work confident that snapshots remain available to compare against when the time is right.",
        imgsrc: "http://www.fillmurray.com/g/500/500",
      },
      {
        title: "Run a comparison of edits to snapshots",
        copy: "Run differences to compare changes in each object against baseline shapshots.",
        imgsrc: "http://www.fillmurray.com/g/400/600",
      },
      {
        title: "Inspect differences and adjust",
        copy: `Inspect each difference to see what has changed, if anything.<br/><br/>
        For unexpected differences, bounce between snapshots and original artwork to make updates, rerunning the comparison as needed.`,
        imgsrc: "http://www.fillmurray.com/g/100/100",
      },
      {
        title: "Save a new snapshot",
        copy: `Once only expected differences remain, override the snapshot with the current state of the original artwork.`,
        imgsrc: "http://www.fillmurray.com/g/300/700",
      },
    ];
  }

  render() {
    return html`
      <div class="intro-tour">
        <div class="slide-wrapper">
          ${this.slideContent.map(
            (slideData, index) => html`<intro-tour-slide
              title=${slideData.title}
              copy=${slideData.copy}
              imgsrc=${slideData.imgsrc}
              ?visible=${this.currentslide === index}
              ?lastslide=${index === this.slideContent.length - 1}
            ></intro-tour-slide>`
          )}
        </div>

        <div class="slide-controls">
          <button
            class="icon-button ${this.currentslide !== 0 ? "visible" : ""}"
            @click=${this._handlePrevSlideClick}
          >
            <span class="button-text">Previous</span> ${unsafeSVG(
              MendelsohnIcons.prev
            )}
          </button>
          <div class="slide-controls-indicator">
            ${this.slideContent.map(
              (slideData, index) =>
                html`<div
                  class="slide-controls-index-indicator ${index ===
                  this.currentslide
                    ? "active"
                    : ""}"
                ></div>`
            )}
          </div>
          <button
            class="icon-button ${this.currentslide !==
            this.slideContent.length - 1
              ? "visible"
              : ""}"
            @click=${this._handleNextSlideClick}
          >
            <span class="button-text">Next</span> ${unsafeSVG(
              MendelsohnIcons.next
            )}
          </button>
        </div>
      </div>
    `;
  }

  private _updateCurrentSlideIndex(newIndex) {
    if (newIndex >= 0 && newIndex < this.slideContent.length) {
      this.currentslide = newIndex;
    }
  }

  private _handleNextSlideClick(e: Event) {
    this._updateCurrentSlideIndex(this.currentslide + 1);
  }

  private _handlePrevSlideClick(e: Event) {
    this._updateCurrentSlideIndex(this.currentslide - 1);
  }
}
