import { html } from 'lit-html';
import '@api-components/raml-aware/raml-aware.js';
import '@polymer/paper-styles/typography.js';
import '@polymer/paper-styles/shadow.js';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-toast/paper-toast.js';
import '../../api-navigation.js';

export class DemoPageBase {
  constructor() {
    this._apiChanged = this._apiChanged.bind(this);
    this._searchApiHandler = this._searchApiHandler.bind(this);
    this._searchButtonHandler = this._searchButtonHandler.bind(this);
    this._navChanged = this._navChanged.bind(this);

    window.addEventListener('api-navigation-selection-changed', this._navChanged);
    setTimeout(() => {
      document.getElementById('apiList').selected = 0;
    });
  }

  get amf() {
    return this._amf;
  }

  set amf(value) {
    this._setObservableProperty('amf', value);
  }

  get latestSelected() {
    return this._latestSelected;
  }

  set latestSelected(value) {
    this._setObservableProperty('latestSelected', value);
  }

  get latestType() {
    return this._latestType;
  }

  set latestType(value) {
    this._setObservableProperty('latestType', value);
  }

  get query() {
    return this._query;
  }

  set query(value) {
    this._setObservableProperty('query', value);
  }

  _setObservableProperty(prop, value) {
    const key = '_' + prop;
    if (this[key] === value) {
      return;
    }
    this[key] = value;
    this.render();
  }

  _apiChanged(e) {
    const file = e.target.selectedItem.dataset.file;
    this._loadFile(file);
  }

  _loadFile(file) {
    fetch('./' + file)
    .then((response) => response.json())
    .then((data) => {
      this.amf = data;
    });
  }

  _navChanged(e) {
    const { selected, type } = e.detail;
    this.latestSelected = selected;
    this.latestType = type;
    const navToast = document.getElementById('navToast');
    navToast.text = 'Navigation occured. Type: ' + type + ', id: ' + selected;
    navToast.opened = true;
  }

  _searchApiHandler(e) {
    const v = e.target.value;
    this._updateQuery(v);
  }

  _searchButtonHandler(e) {
    const v = e.target.previousElementSibling.value;
    this._updateQuery(v);
  }

  _updateQuery(q) {
    this.query = q;
  }

  apiListTemplate() {
    return html`
    <paper-item data-file="demo-api.json">Demo API</paper-item>
    <paper-item data-file="demo-api-compact.json">Demo API - compact</paper-item>
    <paper-item data-file="types-list.json">Types list issue demo</paper-item>
    <paper-item data-file="exchange-experience-api.json">Exchange API</paper-item>
    <paper-item data-file="exchange-experience-api-compact.json">Exchange API - compact</paper-item>
    <paper-item data-file="oauth1-fragment.json">OAuth1 fragment</paper-item>
    <paper-item data-file="missing-endpoints.json">Missing endpoints issue</paper-item>
    <paper-item data-file="rearrange-api.json">Rearranged endpoints</paper-item>`;
  }

  headerTemplate() {
    return html`<raml-aware .api="${this.amf}" scope="api-demo"></raml-aware>
    <header>
      <paper-dropdown-menu label="Select demo API">
        <paper-listbox slot="dropdown-content" id="apiList" @selected-changed="${this._apiChanged}">
        ${this.apiListTemplate()}
        </paper-listbox>
      </paper-dropdown-menu>

      <div class="search-container">
        <input type="search" @search="${this._searchApiHandler}"/>
        <button class="search-button" @click="${this._searchButtonHandler}">Search API</button>
      </div>
    </header>`;
  }
}
