import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("m-button")
class MButton extends LitElement {
  @property()
  variant: string;

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
    return html` <button class=${this.variant}><slot></slot></button> `;
  }
}
