import { html, render } from 'lit-html';
import {DemoPageBase} from './lib/common.js';

export class AnypointDemoPage extends DemoPageBase {
  render() {
    render(html`
    ${this.headerTemplate()}
    <section role="main" class="vertical-section-container centered main">
      <h1 id="regular">Anypoint styling</h1>
      <p>This demo page uses custom CSS properties to style the element</p>
      <div role="region" class="box anypoint-container" aria-labelledby="regular">
        <api-navigation
          summary=""
          aware="api-demo"
          .query="${this.query}"
          endpoints-opened=""></api-navigation>
      </div>
    </section>

    <paper-toast id="navToast"></paper-toast>`, document.querySelector('#demo'));
  }
}
const instance = new AnypointDemoPage();
instance.render();
window._demo = instance;
