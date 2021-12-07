import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("m-button")
class MButton extends LitElement {
  static styles = css`
    button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      margin: 0;
    }
  `;

  render() {
    return html`
      <button><slot></slot></button>
`;
  }
}
