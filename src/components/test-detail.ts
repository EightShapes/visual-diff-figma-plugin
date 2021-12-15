import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("test-detail")
class TestDetail extends LitElement {
  @property()
  name: string;

  render() {
    return html`<m-button @click=${this._changeView} data-view="test-list"
        >Back</m-button
      >
      <h1>${this.name}</h1>`;
  }

  // TODO, find a way to share this method across components or build into button
  private _changeView(e: Event) {
    const target = e.target;
    const newView = target.dataset.view;
    this.dispatchEvent(
      new CustomEvent("changeview", {
        detail: { newView },
        bubbles: true,
        composed: true,
      })
    );
  }
}
