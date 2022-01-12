import { LitElement, html, css, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import { MendelsohnConstants } from "../MendelsohnConstants";

@customElement("m-button")
class MButton extends LitElement {
  @property()
  variant: string;

  @property()
  size = "auto";

  static styles = css`
    button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      margin: 0;
      text-align: left;
      cursor: pointer;
      color: black;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: ${unsafeCSS(MendelsohnConstants.DEFAULT_FONT_SIZE)};
    }

    .fixed {
      height: 100%;
      width: 100%;
    }

    button.link {
      background: none;
      color: #18a0fb;
      padding: 0;
      cursor: pointer;
    }

    ::slotted(svg) {
      fill: currentColor;
    }
  `;

  render() {
    return html`
      <button class="${this.variant} ${this.size}"><slot></slot></button>
    `;
  }
}
