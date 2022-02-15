import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { MendelsohnMixins } from "./mendelsohn-mixins";
import "./test-list";
import "./test-detail";
import "./create-tests";
import "./intro-tour";
import { MendelsohnConstants } from "../MendelsohnConstants";

@customElement("viewport-manager")
class ViewportManager extends MendelsohnMixins(LitElement) {
  static styles = css`
    :host {
      height: 100%;
    }

    .viewport-manager {
      height: 100%;
      display: flex;
      width: 100%;
      flex-direction: column;
    }
  `;
  @property()
  view: string = "create-tests";

  @property({ type: Boolean })
  pagehastests: boolean = false;

  @property({ type: Array })
  currentselection = [];

  @property({ type: Object })
  tests = {};

  @property({ type: Object })
  activetestwrapper = {};

  @property({ type: String })
  currentpageid;

  @property({ type: String })
  currenttestgroupid;

  render() {
    let viewOutput;
    switch (this.view) {
      case "intro-tour":
        viewOutput = html`<intro-tour></intro-tour>`;
        break;
      case "create-tests":
        viewOutput = html`<create-tests
          currentselection=${JSON.stringify(this.currentselection)}
          tests=${JSON.stringify(this.tests)}
          ?pagehastests=${this.pagehastests}
          currentpageid=${this.currentpageid}
          currenttestgroupid=${this.currenttestgroupid}
        ></create-tests>`;
        break;
      case "test-list":
        viewOutput = html` <test-list
          currentselection=${JSON.stringify(this.currentselection)}
          tests=${JSON.stringify(this.tests)}
          ?pagehastests=${this.pagehastests}
          currentpageid=${this.currentpageid}
        ></test-list>`;
        break;
      case "test-detail":
        const testDetailName =
          this.activetestwrapper.status ===
          MendelsohnConstants.STATUS_ORIGIN_NODE_MISSING
            ? this.activetestwrapper.name
            : this.activetestwrapper.originNodeName;
        viewOutput = html`<test-detail
          name=${testDetailName}
          id=${this.activetestwrapper.id}
          status=${this.activetestwrapper.status}
          createdat=${this.activetestwrapper.createdAt}
          lastrunat=${this.activetestwrapper.lastRunAt}
          viewproportion=${this.activetestwrapper.viewProportion}
          originnodeid=${this.activetestwrapper.originNodeId}
          ?running=${this.activetestwrapper.running}
        ></test-detail>`;
        break;
      case "tutorial":
        viewOutput = html` <div>
          <h1>Tutorial</h1>
          <button
            @click="${() => {
              this._changeView("test-list");
            }}"
          >
            Show Create Tests
          </button>
        </div>`;
        break;
    }
    return html`
      <div
        class="viewport-manager"
        @changeview=${this._changeViewListener}
        @postmessage=${this._handlePostMessage}
      >
        ${viewOutput}
      </div>
    `;
  }

  private _changeViewListener(e: CustomEvent) {
    const newView = e.detail.newView;
    if (newView === "test-detail") {
      this.activetestwrapper = e.detail.test;
    }
    this.view = newView;
  }

  private _handlePostMessage(e: CustomEvent) {
    window.parent.postMessage(
      {
        pluginMessage: e.detail,
      },
      "*"
    );
  }
}
