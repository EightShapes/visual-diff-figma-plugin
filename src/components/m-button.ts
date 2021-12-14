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
    }

    .link {
      background: none;
      color: blue;
      padding: 0;
    }
  `;

  render() {
    return html` <button class=${this.variant}><slot></slot></button> `;
  }
}
