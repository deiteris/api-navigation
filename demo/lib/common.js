import { html } from 'lit-html';
import { DemoPage } from '@advanced-rest-client/arc-demo-helper/src/DemoPage.js';
import '@anypoint-web-components/anypoint-dropdown-menu/anypoint-dropdown-menu.js';
import '@anypoint-web-components/anypoint-listbox/anypoint-listbox.js';
import '@anypoint-web-components/anypoint-item/anypoint-item.js';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '../../api-navigation.js';

export class NavDemoPage extends DemoPage {
  constructor() {
    super();
    this.componentName = 'api-navigation';
    this.renderViewControls = true;

    this._apiChanged = this._apiChanged.bind(this);
    this._navChanged = this._navChanged.bind(this);
    this._searchApiHandler = this._searchApiHandler.bind(this);
    this._searchButtonHandler = this._searchButtonHandler.bind(this);

    /**
     * AMF model read from the API model file downloaded aftwer initialization.
     * @type {Array<Object>|Object}
     */
    this.amf = null;

    this.initObservableProperties([
      'amf',
      'query',
      'latestSelected',
      'latestType',
      'latestEndpoint',
    ]);

    window.addEventListener(
      'api-navigation-selection-changed',
      this._navChanged
    );
    document.body.classList.add('api');
  }

  /**
   * Sets default API selection when the view is rendered.
   */
  firstRender() {
    super.firstRender();
    document.getElementById('apiList').selected = 0;
  }

  _apiChanged(e) {
    const file = e.target.selectedItem.dataset.src;
    this._loadFile(file);
  }

  async _loadFile(file) {
    const response = await fetch(`./${file}`);
    const data = await response.json();
    this.amf = data;
  }

  _navChanged(e) {
    const { selected, type, endpoint } = e.detail;
    this.latestSelected = selected;
    this.latestType = type;
    this.latestEndpoint = endpoint;
  }

  _searchApiHandler(e) {
    const { value } = e.target;
    this._updateQuery(value);
  }

  _searchButtonHandler(e) {
    const { value } = e.target.previousElementSibling;
    this._updateQuery(value);
  }

  _updateQuery(q) {
    this.query = q;
  }

  _apiListTemplate() {
    return [
      ['demo-api', 'Demo API'],
      ['exchange-experience-api', 'Exchange Experience API'],
      ['oauth1-fragment', 'OAuth1 fragment'],
      ['types-list', 'Types list issue'],
      ['missing-endpoints', 'Missing endpoints issue'],
      ['rearrange-api', 'Rearranged endpoints'],
      ['simple-api', 'Simple API'],
      ['api-keys', 'API key'],
      ['oas-demo', 'OAS Demo API'],
      ['oauth-flows', 'OAS OAuth Flow'],
      ['oas-bearer', 'OAS Bearer'],
      ['ext-docs', 'External docs'],
      ['APIC-449', 'APIC-449'],
      ['async-api', 'AsyncAPI'],
      ['unordered-endpoints', 'Unordered endpoints API'],
    ].map(
      ([file, label]) => html`
        <anypoint-item data-src="${file}-compact.json"
          >${label} - compact model</anypoint-item
        >
        <anypoint-item data-src="${file}.json">${label}</anypoint-item>
      `
    );
  }

  /**
   * Call this on the top of the `render()` method to render demo navigation
   * @return {Object} HTML template for demo header
   */
  headerTemplate() {
    const { componentName } = this;
    return html` <header>
      ${componentName ? html`<h1 class="api-title">${componentName}</h1>` : ''}
      <anypoint-dropdown-menu
        aria-label="Activate to select demo API"
        aria-expanded="false"
      >
        <label slot="label">Select demo API</label>
        <anypoint-listbox
          slot="dropdown-content"
          id="apiList"
          @selected-changed="${this._apiChanged}"
        >
          ${this._apiListTemplate()}
        </anypoint-listbox>
      </anypoint-dropdown-menu>
      <div class="search-container">
        <input
          type="search"
          @search="${this._searchApiHandler}"
          aria-label="API search field"
        />
        <button class="search-button" @click="${this._searchButtonHandler}">
          Search API
        </button>
      </div>
      <div class="spacer"></div>
      ${this._viewControlsTemplate()}
    </header>`;
  }
}
