import { html } from 'lit-html';
import { NavDemoPage } from './lib/common.js';
import '@anypoint-web-components/anypoint-checkbox/anypoint-checkbox.js';

export class DemoPage extends NavDemoPage {
  constructor() {
    super();
    this.initObservableProperties([
      'summary', 'noink', 'allowPaths', 'rearrangeEndpoints', 'operationsOpened', 'noOverview', 'renderFullPaths'
    ]);
    this.compatibility = false;
    this.summary = true;
    this.noink = false;
    this.allowPaths = false;
    this.rearrangeEndpoints = false;
    this.operationsOpened = true;
    this.noOverview = false;
    this.renderFullPaths = false;
  }

  _demoTemplate() {
    const {
      demoStates,
      darkThemeActive,
      compatibility,
      amf,
      summary,
      noink,
      allowPaths,
      rearrangeEndpoints,
      operationsOpened,
      noOverview,
      renderFullPaths,
    } = this;
    return html `
    <section class="documentation-section">
      <h3>Interactive demo</h3>
      <p>
        This demo lets you preview the API response document element with various
        configuration options.
      </p>

      <arc-interactive-demo
        .states="${demoStates}"
        @state-changed="${this._demoStateHandler}"
        ?dark="${darkThemeActive}"
      >
        <api-navigation
          .amf="${amf}"
          .query="${this.query}"
          endpointsOpened
          ?summary="${summary}"
          ?noink="${noink}"
          ?allowPaths="${allowPaths}"
          ?rearrangeEndpoints="${rearrangeEndpoints}"
          ?compatibility="${compatibility}"
          ?noOverview="${noOverview}"
          slot="content"
          ?operationsOpened="${operationsOpened}"
          ?renderFullPaths="${renderFullPaths}"
        ></api-navigation>

        <label slot="options" id="mainOptionsLabel">Options</label>

        <anypoint-checkbox
          aria-describedby="mainOptionsLabel"
          slot="options"
          name="summary"
          checked
          @change="${this._toggleMainOption}"
        >
          Summary
        </anypoint-checkbox>
        <anypoint-checkbox
          aria-describedby="mainOptionsLabel"
          slot="options"
          name="noink"
          @change="${this._toggleMainOption}"
        >
          No ink
        </anypoint-checkbox>
        <anypoint-checkbox
          aria-describedby="mainOptionsLabel"
          slot="options"
          name="allowPaths"
          @change="${this._toggleMainOption}"
        >
          Allow paths
        </anypoint-checkbox>
        <anypoint-checkbox
          aria-describedby="mainOptionsLabel"
          slot="options"
          name="rearrangeEndpoints"
          @change="${this._toggleMainOption}"
        >
          Sort endpoints
        </anypoint-checkbox>
        <anypoint-checkbox
          aria-describedby="mainOptionsLabel"
          slot="options"
          name="operationsOpened"
          @change="${this._toggleMainOption}"
        >
          Operations opened
        </anypoint-checkbox>
        <anypoint-checkbox
          aria-describedby="mainOptionsLabel"
          slot="options"
          name="noOverview"
          @change="${this._toggleMainOption}"
        >
          No overview
        </anypoint-checkbox>
        </anypoint-checkbox>
        <anypoint-checkbox
          aria-describedby="mainOptionsLabel"
          slot="options"
          name="renderFullPaths"
          @change="${this._toggleMainOption}"
        >
          Render full paths
        </anypoint-checkbox>
      </arc-interactive-demo>
    </section>`;
  }

  _introductionTemplate() {
    return html `
      <section class="documentation-section">
        <h3>Introduction</h3>
        <p>
          A web component to render navigation for an API document. The view is rendered
          using the AMF data model.
        </p>
      </section>
    `;
  }

  _usageTemplate() {
    return html `
      <section class="documentation-section">
        <h2>Usage</h2>
        <p>API navigation comes with 2 predefined styles:</p>
        <ul>
          <li><b>Material Design</b> (default)</li>
          <li>
            <b>Compatibility</b> - To provide compatibility with Anypoint design, use
            <code>compatibility</code> property
          </li>
        </ul>
      </section>`;
  }

  contentTemplate() {
    return html`
    <h2 class="centered main">API navigation</h2>
    ${this._demoTemplate()}
    ${this._introductionTemplate()}
    ${this._usageTemplate()}
    `;
  }

  // render() {
  //   render(html`
  //   ${this.headerTemplate()}
  //   <h1>API navigation</h1>
  //   <section role="main" class="vertical-section-container centered main">
  //     <div role="region" class="box" aria-labelledby="regular">
  //       <p>Latest selected object: ${this.latestSelected}</p>
  //       <p>Latest selected type: ${this.latestType}</p>
  //       <h2 id="regular">Regular navigation</h2>
  //
  //     </div>
  //
  //     <div role="region" class="box" aria-labelledby="themed">
  //       <h2 id="themed">Themed navigation</h2>
  //       <api-navigation
  //         aware="api-demo"
  //         .query="${this.query}"
  //         class="themed"></api-navigation>
  //     </div>
  //   </section>
  //
  //   <paper-toast id="navToast"></paper-toast>`, document.querySelector('#demo'));
  // }
}
const instance = new DemoPage();
instance.render();
