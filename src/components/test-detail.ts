import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("test-detail")
class TestDetail extends LitElement {
  @property()
  name: string;

  render() {
    return html`<h1>${this.name}</h1>`;
  }
}
