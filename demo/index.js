import { html, render } from 'lit-html';
import '@api-components/raml-aware/raml-aware.js';
import '@polymer/paper-styles/typography.js';
import '@polymer/paper-styles/shadow.js';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-toast/paper-toast.js';
import '../api-navigation.js';

export class DemoPage {
  constructor() {
    this._apiChanged = this._apiChanged.bind(this);

    setTimeout(() => {
      document.getElementById('apiList').selected = 0;
    });
  }

  get amfModel() {
    return this._amfModel;
  }

  set amfModel(value) {
    this._setObservableProperty('amfModel', value);
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
      this.amfModel = data;
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

  apiListTemplate() {
    return html`
    <paper-item data-file="demo-api.json">Demo API</paper-item>
    <paper-item data-file="demo-api-compact.json">Demo API - compact</paper-item>
    <paper-item data-file="types-list.json">Types list issue demo</paper-item>
    <paper-item data-file="exchange-experience-api.json">Exchange API</paper-item>
    <paper-item data-file="exchange-experience-api-compact.json">Exchange API - compact</paper-item>
    <paper-item data-file="oauth1-fragment.json">OAuth1 fragment</paper-item>
    <paper-item data-file="missing-endpoints.json">Missing endpoints issue</paper-item>`;
  }

  render() {
    render(html`
    <raml-aware .api="${this.amfModel}" scope="api-demo"></raml-aware>
    <header>
      <paper-dropdown-menu label="Select demo API">
        <paper-listbox slot="dropdown-content" id="apiList" @selected-changed="${this._apiChanged}">
        ${this.apiListTemplate()}
        </paper-listbox>
      </paper-dropdown-menu>
    </header>

    <section role="main" class="vertical-section-container centered main">
      <div role="region" class="box" aria-labelledby="regular">
        <p>Latest selected object: ${this.latestSelected}</p>
        <p>Latest selected type: ${this.latestType}</p>
        <h2 id="regular">Regular navigation</h2>
        <api-navigation
          summary=""
          aware="api-demo"
          endpoints-opened=""></api-navigation>
      </div>

      <div role="region" class="box" aria-labelledby="themed">
        <h2 id="themed">Themed navigation</h2>
        <api-navigation aware="api-demo" class="themed"></api-navigation>
      </div>
    </section>

    <paper-toast id="navToast"></paper-toast>`, document.querySelector('#demo'));
  }
}
const instance = new DemoPage();
instance.render();
window.addEventListener('api-navigation-selection-changed', instance._navChanged.bind(instance));
window._demo = instance;
