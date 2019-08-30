import { html, render } from 'lit-html';
import { DemoPageBase } from './lib/common.js';

export class DemoPage extends DemoPageBase {
  render() {
    render(html`
    ${this.headerTemplate()}
    <h1>API navigation</h1>
    <section role="main" class="vertical-section-container centered main">
      <div role="region" class="box" aria-labelledby="regular">
        <p>Latest selected object: ${this.latestSelected}</p>
        <p>Latest selected type: ${this.latestType}</p>
        <h2 id="regular">Regular navigation</h2>
        <api-navigation
          summary
          aware="api-demo"
          .query="${this.query}"
          endpoints-opened></api-navigation>
      </div>

      <div role="region" class="box" aria-labelledby="themed">
        <h2 id="themed">Themed navigation</h2>
        <api-navigation
          aware="api-demo"
          .query="${this.query}"
          class="themed"></api-navigation>
      </div>
    </section>

    <paper-toast id="navToast"></paper-toast>`, document.querySelector('#demo'));
  }
}
const instance = new DemoPage();
instance.render();
window._demo = instance;
