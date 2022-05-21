/* eslint-disable lit-a11y/click-events-have-key-events */
import { LitElement, html } from 'lit-element';
import { AmfHelperMixin } from '@api-components/amf-helper-mixin/amf-helper-mixin.js';
import '@api-components/raml-aware/raml-aware.js';
import '@anypoint-web-components/anypoint-button/anypoint-icon-button.js';
import {
  keyboardArrowDown,
  openInNew,
} from '@advanced-rest-client/arc-icons/ArcIcons.js';
import '@anypoint-web-components/anypoint-collapse/anypoint-collapse.js';
import httpMethodStyles from '@api-components/http-method-label/http-method-label-common-styles.js';
import navStyles from './Styles.js';

/* eslint-disable no-plusplus */
/* eslint-disable no-continue */
/* eslint-disable max-len */
/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */
/* eslint-disable prefer-destructuring */
/* eslint-disable consistent-return */

/** @typedef {import('@anypoint-web-components/anypoint-collapse').AnypointCollapseElement} AnypointCollapseElement */
/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('./types').MethodItem} MethodItem */
/** @typedef {import('./types').EndpointItem} EndpointItem */
/** @typedef {import('./types').SecurityItem} SecurityItem */
/** @typedef {import('./types').TypeItem} TypeItem */
/** @typedef {import('./types').DocumentationItem} DocumentationItem */
/** @typedef {import('./types').TargetModel} TargetModel */

/**
 * Maps authorization scheme name to a label
 * @param {string} name
 * @return {string}
 */
function mapAuthName(name) {
  switch (name) {
    case 'http':
      return 'HTTP';
    case 'openIdConnect':
      return 'OpenID Connect';
    default:
      return name;
  }
}

/**
 * Discretely updates tabindex values among menu items as the focused item
 * changes.
 *
 * @param {HTMLElement} focusedItem The element that is currently focused.
 * @param {HTMLElement=} old The last element that was considered focused, if
 * applicable.
 */
function focusedItemChanged(focusedItem, old) {
  if (old) {
    old.setAttribute('tabindex', '-1');
  }
  if (focusedItem && !focusedItem.hasAttribute('disabled')) {
    focusedItem.setAttribute('tabindex', '0');
    focusedItem.focus();
  }
}

/**
 * Computes label for an endpoint when name is missing and the endpoint
 * is indented, hence name should be truncated.
 * @param {string} currentPath Endpoint's path
 * @param {string[]} parts Path parts
 * @param {number} indent Endpoint indentation
 * @param {string[]} basePaths List of base paths already used.
 * @return {string} Name of the path to render.
 */
export function computePathName(currentPath, parts, indent, basePaths) {
  let path = '';
  const latestBasePath = basePaths[basePaths.length - 1];
  for (let i = 0, len = parts.length - 1; i < len; i++) {
    path += `/${parts[i]}`;
    if (!latestBasePath || latestBasePath.indexOf(`${path}/`) !== -1) {
      indent--;
    }
    if (indent === 0) {
      break;
    }
  }
  return currentPath.replace(path, '');
}

/**
 * Computes condition value to render path label.
 * @param {boolean} allowPaths Component configuration property.
 * @param {boolean} renderPath Endpoint property
 * @return {boolean} True if both arguments are truly.
 */
export function computeRenderPath(allowPaths, renderPath) {
  return !!(allowPaths && renderPath);
}

/**
 * `api-navigation`
 * A navigation for an API spec using AMF model.
 *
 * This element is to replace deprecated `raml-path-selector`.
 * It is lightweight and much less complex in comparison.
 *
 * The element works with [AMF](https://github.com/mulesoft/amf)
 * json/ld model. When the model is set it computes list of documentation
 * nodes, types, endpoints, methods and security schemas.
 * As a result user can select any of the items in the UI and the application
 * is informed about user choice via custom event.
 *
 * The selection is a selected API shape `@id`. The application is responsible
 * for computing the model selected by the user.
 *
 * AMF model can be passed directly by setting `amf` property or by
 * setting `aware` property and by use `raml-aware` element. It allows
 * to communicate AMF data without having access to the element due to
 * shadow DOM restrictions.
 *
 * ```html
 * <raml-aware scope="api-console"></raml-aware>
 * <api-navigation aware="api-console"></api-navigation>
 * ```
 *
 * Once the `raml-aware` element receives some data it's instantly
 * transferred to `api-navigation`.
 *
 * Note, this element does not contain polyfills for Array platform features.
 * Use `arc-polyfills` to add support for IE and Safari 9.
 *
 * ## Passive navigation
 *
 * Passive navigation means that a navigation event occurred but it wasn't
 * invoked by intentional user interaction. For example
 * `api-endpoint-documentation` component renders list of documentations for
 * HTTP methods. While scrolling through the list navigation context
 * changes (user reads documentation of a method) but the navigation never
 * was caused by user intentional interaction.
 * This event, annotated with `passive: true` property in the detail object
 * prohibits other element from taking a navigation action but some
 * may reflect the change in the UI.
 */
export class ApiNavigation extends AmfHelperMixin(LitElement) {
  static get properties() {
    return {
      /**
       * `raml-aware` scope property to use.
       */
      aware: { type: String, reflect: true },
      /**
       * A model `@id` of selected documentation part.
       * Special case is for `summary` view. It's not part of an API
       * but most applications has some kins of summary view for the
       * API.
       */
      selected: { type: String, reflect: true },
      /**
       * Type of the selected item.
       * One of `documentation`, `type`, `security`, `endpoint`, `method`
       * or `summary`.
       *
       * This property is set after `selected` property.
       */
      selectedType: { type: String, reflect: true },
      /**
       * If set it renders `API summary` menu option.
       * It will allow to set `selected` and `selectedType` to `summary`
       * when this option is set.
       */
      summary: { type: Boolean, reflect: true },
      /**
       * A label for the `summary` section.
       */
      summaryLabel: { type: String, reflect: true },
      /**
       * Computed list of documentation items in the API.
       */
      _docs: { type: Array },
      /**
       * Determines and changes state of documentation panel.
       */
      docsOpened: { type: Boolean, reflect: true },
      /**
       * Computed list of "type" items in the API.
       */
      _types: { type: Array },
      /**
       * Determines and changes state of types panel.
       */
      typesOpened: { type: Boolean, reflect: true },
      /**
       * Computed list of Security schemes items in the API.
       */
      _security: { type: Array },
      /**
       * Determines and changes state of security panel.
       */
      securityOpened: { type: Boolean, reflect: true },
      /**
       * Computed list of endpoint items in the API.
       */
      _endpoints: { type: Array },
      /**
       * Determines and changes state of endpoints panel.
       */
      endpointsOpened: { type: Boolean, reflect: true },
      /**
       * If true, the element will not produce a ripple effect when interacted with via the pointer.
       */
      noink: { type: Boolean, reflect: true },
      /**
       * Filters list elements by this value when set.
       * Clear the value to reset the search.
       *
       * This is not currently exposed in element's UI due
       * to complexity of search and performance.
       */
      query: { type: String, reflect: true },
      __effectiveQuery: { type: String },
      /**
       * Size of endpoint indentation for nested resources.
       * In pixels.
       *
       * The attribute name for this property is `indent-size`. Note, that this
       * will change to web consistent name `indentSize` in the future.
       */
      indentSize: { type: Number, reflect: true, attribute: 'indent-size' },
      /**
       * Flag set when passed AMF model is a RAML fragment.
       */
      _isFragment: { type: Boolean },
      /**
       * When set it renders full path below endpoint name if the endpoint has
       * a name (different than the path).
       * This is not always recommended to use this option as some complex APIs
       * may render this component difficult to understand.
       */
      allowPaths: { type: Boolean },
      /**
       * If this value is set, then the navigation component will sort the list
       * of endpoints alphabetically based on the `path` value of the endpoint
       */
      rearrangeEndpoints: { type: Boolean },
      /**
       * Enables compatibility with Anypoint components.
       */
      compatibility: { type: Boolean },
      /**
       * Determines and changes state of endpoints.
       */
      operationsOpened: { type: Boolean, reflect: true },
      /**
       * List of opened operations id
       */
      _openedOperations: { type: Array, reflect: true },
      /**
       * No overview as a separated element. Overview can be seen by clicking the endpoint label.
       */
      noOverview: { type: Boolean },
      /**
       * When set, avoiids truncating and indentation of endpoint paths.
       * Instead, the full path for each endpoint will be rendered.
       */
      renderFullPaths: { type: Boolean },
    };
  }

  get styles() {
    return [navStyles, httpMethodStyles];
  }

  get selected() {
    return this._selected;
  }

  set selected(value) {
    const old = this._selected;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._selected = value;
    this.requestUpdate('selected', old);
    this._selectedChanged(value);
    this._selectionChanged(value, this.selectedType);
    this.dispatchEvent(
      new CustomEvent(`selected-changed`, {
        composed: true,
        detail: {
          value,
        },
      })
    );
  }

  get selectedType() {
    return this._selectedType;
  }

  set selectedType(value) {
    const old = this._selectedType;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._selectedType = value;
    this.requestUpdate('selectedType', old);
    this._selectionChanged(this.selected, value);
    this.dispatchEvent(
      new CustomEvent(`selectedtype-changed`, {
        composed: true,
        detail: {
          value,
        },
      })
    );
  }

  set operationsOpened(value) {
    const old = this._operationsOpened;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._operationsOpened = value;

    if (value === undefined) {
      return;
    }

    this._updatedOpenedOperations = !value;
    if (!value) {
      this._openedOperations = [];
    } else {
      this._addOpenedOperations(this._endpoints);
    }
  }

  get operationsOpened() {
    return this._operationsOpened;
  }

  _addOpenedOperations(endpoints) {
    if (!this._updatedOpenedOperations && endpoints) {
      this._openedOperations = endpoints.map(e => e.id);
      this._updatedOpenedOperations = true;
    }
  }

  /**
   * @return {Boolean} true when `_docs` property is set with values
   */
  get hasDocs() {
    const { _docs } = this;
    return !!(_docs && _docs.length);
  }

  /**
   * @return {Boolean} true when `_types` property is set with values
   */
  get hasTypes() {
    const { _types } = this;
    return !!(_types && _types.length);
  }

  /**
   * @return {Boolean} true when `_security` property is set with values
   */
  get hasSecurity() {
    const { _security } = this;
    return !!(_security && _security.length);
  }

  /**
   * @return {Boolean} true when `_endpoints` property is set with values
   */
  get hasEndpoints() {
    const { _endpoints } = this;
    return !!(_endpoints && _endpoints.length);
  }

  /**
   * @return {boolean} True when summary should be rendered.
   * Summary should be rendered only when `summary` is set and
   * current model is not a RAML fragment.
   */
  get _renderSummary() {
    const { summary, _isFragment } = this;
    return !!(summary && !_isFragment);
  }

  get query() {
    return this._query;
  }

  set query(value) {
    const old = this._query;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._query = value;
    this.requestUpdate('query', old);
    this._queryChanged();
  }

  /**
   * @return {HTMLElement=} A reference to currently selected node.
   */
  get selectedItem() {
    return this._selectedItem;
  }

  /**
   * @return {HTMLElement=} The currently focused item.
   */
  get focusedItem() {
    return this._focusedItem;
  }

  get _focusedItem() {
    return this.__focusedItem;
  }

  set _focusedItem(value) {
    const old = this.__focusedItem;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this.__focusedItem = value;
    focusedItemChanged(value, old);
  }

  get noOverview() {
    return this._noOverview;
  }

  set noOverview(value) {
    const old = this._noOverview;
    if (old === value) {
      return;
    }
    this._noOverview = value;
    this.requestUpdate('noOverview', old);
    this._items = null;
  }

  set rearrangeEndpoints(value) {
    const old = this.__rearrangeEndpoints;
    if (old === value) {
      return;
    }
    this.__rearrangeEndpoints = value;
    this.requestUpdate('rearrangeEndpoints', old);
    this.__amfChanged(this.amf);
  }

  get rearrangeEndpoints() {
    return this.__rearrangeEndpoints;
  }

  set renderFullPaths(value) {
    const old = this._renderFullPaths;
    if (old === value) {
      return;
    }
    this._renderFullPaths = value;
    this.requestUpdate('renderFullPaths', old);
    this.__amfChanged(this.amf);
  }

  get renderFullPaths() {
    return this._renderFullPaths;
  }

  constructor() {
    super();

    this.summaryLabel = 'Summary';
    this._isFragment = false;
    this.summary = false;
    this.noink = false;
    this.allowPaths = false;
    this.compatibility = false;
    this.rearrangeEndpoints = false;
    this.indentSize = 8;
    this._selectedItem = null;
    this.aware = null;
    this._openedOperations = [];
    this._updatedOpenedOperations = true;
    this.noOverview = false;
    this.renderFullPaths = false;

    this._navigationChangeHandler = this._navigationChangeHandler.bind(this);
    this._focusHandler = this._focusHandler.bind(this);
    this._keydownHandler = this._keydownHandler.bind(this);
  }

  /**
   * Ensures aria role attribute is in place.
   * Attaches element's listeners.
   */
  connectedCallback() {
    if (super.connectedCallback) {
      super.connectedCallback();
    }
    // @ts-ignore
    if (window.ShadyCSS) {
      // @ts-ignore
      window.ShadyCSS.styleElement(this);
    }
    // Pawel: This role requires children to be present in the DOM, but in this case none is rendered
    // in the light DOM but rather in the shadow DOM. Therefore the element cannot have this role.
    // if (!this.getAttribute('role')) {
    //   this.setAttribute('role', 'menubar');
    // }
    if (!this.getAttribute('aria-label')) {
      this.setAttribute('aria-label', 'API structure');
    }
    if (!this.getAttribute('tabindex')) {
      this.setAttribute('tabindex', '0');
    }
    window.addEventListener(
      'api-navigation-selection-changed',
      this._navigationChangeHandler
    );
    this.addEventListener('focus', this._focusHandler);
    this.addEventListener('keydown', this._keydownHandler);

    this._resetTabindices();
  }

  disconnectedCallback() {
    if (super.disconnectedCallback) {
      super.disconnectedCallback();
    }
    window.removeEventListener(
      'api-navigation-selection-changed',
      this._navigationChangeHandler
    );
    this.removeEventListener('focus', this._focusHandler);
    this.removeEventListener('keydown', this._keydownHandler);
    this._items = null;
  }

  /**
   * Overrides `AmfHelperMixin.__amfChanged()`
   * @param {object[]|object} api AMF model
   * @override
   */
  __amfChanged(api) {
    if (!api) {
      return;
    }
    let model = api;
    if (Array.isArray(model)) {
      [model] = model;
    }
    let data = {};
    let isFragment = true;
    this._items = null;
    const moduleKey = this._getAmfKey(this.ns.aml.vocabularies.document.Module);
    if (this._hasType(model, this.ns.aml.vocabularies.document.Document)) {
      isFragment = false;
      model = this._ensureAmfModel(model);
      data = this._collectData(model);
    } else if (
      this._hasType(
        model,
        this.ns.aml.vocabularies.security.SecuritySchemeFragment
      )
    ) {
      data = this._collectSecurityData(model);
      this.securityOpened = true;
    } else if (
      this._hasType(
        model,
        this.ns.aml.vocabularies.apiContract.UserDocumentationFragment
      )
    ) {
      data = this._collectDocumentationData(model);
      this.docsOpened = true;
    } else if (
      this._hasType(model, this.ns.aml.vocabularies.shapes.DataTypeFragment)
    ) {
      data = this._collectTypeData(model);
      this.typesOpened = true;
    } else if (model['@type'] && moduleKey === model['@type'][0]) {
      data = this._collectData(model);
    }
    if (this._isFragment !== isFragment) {
      this._isFragment = isFragment;
    }
    this._docs = data.documentation;
    this._types = data.types;
    this._security = data.securitySchemes;
    this._endpoints = data.endpoints;
    this._closeCollapses();
    setTimeout(() => {
      this._selectedChanged(this.selected);
      this._resetTabindices();
      this._addOpenedOperations(data.endpoints)
    });
  }

  /**
   * Collects the information about the API and creates data model
   * for the navigation element
   *
   * @param {object} model
   * @return {TargetModel} Data model for the API navigation
   */
  _collectData(model) {
    const result = {
      documentation: [],
      types: [],
      securitySchemes: [],
      endpoints: [],
    };
    if (!model) {
      return result;
    }
    result._typeIds = [];
    result._basePaths = [];
    this._traverseDeclarations(model, result);
    this._traverseReferences(model, result);
    this._traverseEncodes(model, result);
    delete result._typeIds;
    delete result._basePaths;
    return result;
  }

  /**
   * Collects the data from the security fragment
   * @param {object} model Security fragment model
   * @return {TargetModel|undefined}
   */
  _collectSecurityData(model) {
    const result = {
      securitySchemes: [],
    };
    const encodes = this._computeEncodes(model);
    if (!encodes) {
      return undefined;
    }
    this._appendSecurityItem(encodes, result);
    return result;
  }

  /**
   * Collects the data from the documentation fragment
   * @param {object} model Documentation fragment model
   * @return {TargetModel|undefined}
   */
  _collectDocumentationData(model) {
    const result = {
      documentation: [],
    };
    const encodes = this._computeEncodes(model);
    if (!encodes) {
      return undefined;
    }
    this._appendDocumentationItem(encodes, result);
    return result;
  }

  /**
   * Collects the data from the type fragment
   * @param {object} model Type fragment model
   * @return {TargetModel|undefined}
   */
  _collectTypeData(model) {
    const result = {
      types: [],
      _typeIds: [],
    };
    const encodes = this._computeEncodes(model);
    if (!encodes) {
      return undefined;
    }
    this._appendTypeItem(encodes, result);
    delete result._typeIds;
    return result;
  }

  /**
   * Traverses the `http://raml.org/vocabularies/document#declares`
   * node to find types and security schemes.
   *
   * @param {object} model AMF model
   * @param {TargetModel} target Target object where to put data.
   */
  _traverseDeclarations(model, target) {
    const declares = this._computeDeclares(model);
    if (!declares) {
      return;
    }
    declares.forEach(item => this._appendModelItem(item, target));
  }

  /**
   * Traverses the `http://raml.org/vocabularies/document#references`
   *
   * @param {object} model AMF model
   * @param {TargetModel} target Target object where to put data.
   */
  _traverseReferences(model, target) {
    const refs = this._computeReferences(model);
    if (!refs) {
      return;
    }
    refs.forEach(item => {
      if (!this._hasType(item, this.ns.aml.vocabularies.document.Module)) {
        return;
      }
      this._traverseDeclarations(item, target);
    });
  }

  /**
   * Traverses the `http://raml.org/vocabularies/document#encodes`
   * node to find documentation and endpoints.
   *
   * @param {object} model AMF model
   * @param {TargetModel} target Target object where to put data.
   */
  _traverseEncodes(model, target) {
    const data = this._computeApi(model);
    if (!data) {
      return;
    }
    const eKey = this._getAmfKey(this.ns.aml.vocabularies.apiContract.endpoint);
    let endpoint = this._ensureArray(data[eKey]);
    if (this.rearrangeEndpoints) {
      endpoint = this._rearrangeEndpoints(endpoint);
    }
    if (endpoint) {
      endpoint.forEach(item => this._appendModelItem(item, target));
    }
    const dKey = this._getAmfKey(this.ns.aml.vocabularies.core.documentation);
    const documentation = this._ensureArray(data[dKey]);
    if (documentation) {
      documentation.forEach(item => this._appendModelItem(item, target));
    }
  }

  /**
   * Sort endpoints alphabetically based on path
   * @param {EndpointItem[]} endpoints
   * @return {EndpointItem[]}
   */
  _rearrangeEndpoints(endpoints) {
    if (!endpoints) {
      return null;
    }
    const pathKey = this._getAmfKey(this.ns.aml.vocabularies.apiContract.path);
    return [...endpoints].sort((a,b) => {
      const pathA = this._getValue(a, pathKey);
      const pathB = this._getValue(b, pathKey);

      if (pathA < pathB){
        return -1;
      }

      if (pathA > pathB){
        return 1;
      }

      return 0;
    });
  }

  /**
   * Appends declaration of navigation data model to the target if
   * it matches documentation or security types.
   *
   * @param {Object} item AMF model item to check for data.
   * @param {TargetModel} target The target to which append values.
   */
  _appendModelItem(item, target) {
    if (this._hasType(item, this.ns.w3.shacl.Shape)) {
      this._appendTypeItem(item, target);
    } else if (
      this._hasType(item, this.ns.aml.vocabularies.security.SecurityScheme)
    ) {
      this._appendSecurityItem(item, target);
    } else if (
      this._hasType(item, this.ns.aml.vocabularies.core.CreativeWork)
    ) {
      this._appendDocumentationItem(item, target);
    } else if (
      this._hasType(item, this.ns.aml.vocabularies.apiContract.EndPoint)
    ) {
      this._appendEndpointItem(item, target);
    }
  }

  /**
   * Appends "type" item to the results.
   *
   * @param {Object} item Type item declaration
   * @param {TargetModel} target
   */
  _appendTypeItem(item, target) {
    const w3name = /** @type string */ (this._getValue(
      item,
      this.ns.w3.shacl.name
    ));
    if (w3name && w3name.indexOf('amf_inline_type') === 0) {
      // https://www.mulesoft.org/jira/browse/APIMF-972
      return;
    }
    let name = /** @type string */ (this._getValue(
      item,
      this.ns.aml.vocabularies.core.name
    ));
    if (!name && w3name) {
      name = w3name;
    } else if (!name) {
      return;
    }
    const id = item['@id'];
    if (!id) {
      return;
    }
    const rfIdKey = this._getAmfKey(
      this.ns.aml.vocabularies.document.referenceId
    );
    const compareId = item['@id'];
    const refNode = this._ensureArray(item[rfIdKey]);
    const refId = refNode ? refNode[0]['@id'] : undefined;
    const idIndex = target._typeIds.indexOf(compareId);
    const refIndex = refId ? target._typeIds.indexOf(refId) : -1;
    if (idIndex === -1 && refIndex === -1) {
      target._typeIds[target._typeIds.length] = id;
      if (refId) {
        target._typeIds[target._typeIds.length] = refId;
      }
      target.types.push({
        label: name,
        id,
      });
    }
  }

  /**
   * Appends "security" item to the results.
   *
   * @param {Object} item Type item declaration
   * @param {TargetModel} target
   */
  _appendSecurityItem(item, target) {
    const voc = this.ns.aml.vocabularies;
    let name = this._getValue(item, voc.core.displayName);
    if (!name) {
      name = this._getValue(item, voc.security.name);
    }
    if (!name) {
      const apiName = this._getValue(item, voc.core.name);
      const secType = /** @type string */ (this._getValue(
        item,
        voc.security.type
      ));
      let result = '';
      if (apiName) {
        result = `${apiName} - `;
      }
      name = result + mapAuthName(secType);
    }
    const id = item['@id'];
    target.securitySchemes.push({
      label: String(name),
      id,
    });
  }

  _validUrl(url) {
    return url.startsWith('http://') || url.startsWith('https://')
      ? url
      : 'about:blank';
  }

  /**
   * Appends "documentation" item to the results.
   *
   * @param {Object} item Type item declaration
   * @param {TargetModel} target
   */
  _appendDocumentationItem(item, target) {
    const { core } = this.ns.aml.vocabularies;
    const id = item['@id'];
    const urlNode = item[this._getAmfKey(core.url)];
    const title = this._getValue(item, core.title);
    const description = this._getValue(item, core.description);
    const label = title ? String(title) : String(description);
    let isExternal = false;
    let url = urlNode ? (urlNode[0] || urlNode)['@id'] : undefined;
    if (url) {
      url = this._validUrl(url);
      isExternal = true;
    }
    const result = {
      id,
      label,
      isExternal,
      url,
    };
    target.documentation.push(result);
  }

  /**
   * Appends "endpoint" item to the results.
   * This also iterates over methods to extract method data.
   *
   * @param {any} item Endpoint item declaration
   * @param {TargetModel} target
   */
  _appendEndpointItem(item, target) {
    const result = {};

    let name = this._getValue(item, this.ns.aml.vocabularies.core.name);
    const path = /** @type string */ (this._getValue(
      item,
      this.ns.raml.vocabularies.apiContract.path
    ));
    result.path = path;

    let tmpPath = path;
    if (tmpPath[0] === '/') {
      tmpPath = tmpPath.substr(1);
    }
    const parts = tmpPath.split('/');
    let indent = 0;
    target._basePaths[target._basePaths.length] = path;
    if (parts.length > 1 && !this.renderFullPaths) {
      const lowerParts = parts.slice(0, parts.length - 1);
      if (lowerParts.length) {
        for (let i = lowerParts.length - 1; i >= 0; i--) {
          const currentPath = `/${lowerParts.slice(0, i + 1).join('/')}`;
          const previousBasePathItem =
            target._basePaths[target._basePaths.length - 2];
          if (
            previousBasePathItem &&
            (previousBasePathItem === currentPath ||
              previousBasePathItem.startsWith(`${currentPath}/`))
          ) {
            indent++;
          }
        }
      }
    }
    if (!name) {
      result.renderPath = false;
      if (indent > 0) {
        try {
          name = computePathName(path, parts, indent, target._basePaths);
        } catch (_) {
          name = path;
        }
      } else {
        name = path;
      }
    } else {
      result.renderPath = true;
    }
    const id = item['@id'];
    const key = this._getAmfKey(this.ns.aml.vocabularies.apiContract.supportedOperation);
    const operations = this._ensureArray(item[key]) || [];
    const methods = operations.map(op => this._createOperationModel(op));
    result.label = String(name);
    result.id = id;
    result.indent = indent;
    result.methods = methods;
    target.endpoints.push(result);
  }

  /**
   * Creates the view model for an optation.
   *
   * @param {any} item Operation AMF model
   * @return {MethodItem} Method view model
   */
  _createOperationModel(item) {
    const label = /** @type string */ (this._getValue(
      item,
      this.ns.aml.vocabularies.core.name
    ));
    const methodKey = this.ns.aml.vocabularies.apiContract.method;
    const id = item['@id'];
    const method = /** @type string */ (this._getValue(item, methodKey));
    return {
      label,
      id,
      method,
    };
  }

  /**
   * Click handler for section name item.
   * Toggles the view.
   *
   * @param {MouseEvent} e
   */
  _toggleSectionHandler(e) {
    // @ts-ignore: this is for polyfills
    const path = (e.composedPath && e.composedPath()) || e.path;
    let node;
    const test = true;
    while (test) {
      node = path.shift();
      if (!node) {
        return;
      }
      if (node.dataset && node.dataset.section) {
        break;
      }
    }
    this._toggleSection(node);
  }

  _toggleSection(node) {
    const { section } = node.dataset;
    const openedKey = `${section}Opened`;
    this[openedKey] = !this[openedKey];
  }

  /**
   * Selects new item in the menu.
   *
   * @param {HTMLElement} node
   */
  _selectItem(node) {
    const id = node.dataset.apiId;
    const { shape } = node.dataset;
    this.selectedType = undefined; // cancels event firing
    this.selected = id;
    this.selectedType = shape; // now fire event
    this._selectedItem = node;
    this._focusedItem = node;
  }

  /**
   * Toggles selection state of a node that has `data-api-id` set to
   * `id`.
   *
   * @param {string} id Selected node id.
   * @return {string|undefined} Type of selected node.
   */
  _addSelection(id) {
    if (!this.shadowRoot) {
      return undefined;
    }
    let node = /** @type HTMLElement */ (this.shadowRoot.querySelector(
      `[data-api-id="${id}"]`
    ));
    if (!node) {
      return undefined;
    }
    if (node.localName === 'anypoint-collapse') {
      node = this.shadowRoot.querySelector(`.operation[data-api-id="${id}"]`);
    } else if (node.className === 'endpoint-name-overview' && this.noOverview) {
      node = this.shadowRoot.querySelector(`.endpoint[data-endpoint-id="${id}"]`);
    }
    if (!node) {
      return undefined;
    }
    node.classList.add('selected');
    // @ts-ignore
    if (node.part && node.part.add) {
      // @ts-ignore
      node.part.add('api-navigation-list-item-selected');
    }
    let collapse;
    switch (node.dataset.shape) {
      case 'method':
        collapse = /** @type AnypointCollapseElement */ (node.parentElement);
        this.endpointsOpened = true;
        break;
      case 'endpoint':
        collapse = /** @type AnypointCollapseElement */ (node.parentElement);
        break;
      case 'type':
      case 'documentation':
      case 'security':
        collapse = /** @type AnypointCollapseElement */ (node.parentElement
          .parentElement);
        break;
      default:
        collapse = undefined;
    }
    if (node.dataset.shape === 'method' || node.dataset.shape === 'endpoint') {
      if (!this._openedOperations.includes(id)) {
        this.toggleOperations(id)
      }
      if (collapse && !this._openedOperations.includes(collapse.dataset.apiId)) {
        this.toggleOperations(collapse.dataset.apiId);
      }
    } else if (collapse && !collapse.opened) {
      collapse.opened = true;
    }
    return node.dataset.shape;
  }

  /**
   * Removes any current selection that may exist.
   */
  _clearSelection() {
    if (!this.shadowRoot) {
      return;
    }
    const nodes = this.shadowRoot.querySelectorAll('.selected');
    for (let i = 0, len = nodes.length; i < len; i++) {
      const node = nodes[i];
      node.classList.remove('selected');
      // @ts-ignore
      if (node.part && node.part.remove) {
        // @ts-ignore
        node.part.remove('api-navigation-list-item-selected');
      }
    }
  }

  /**
   * Toggles endpoint operations list.
   *
   * @param {string} id ID of the endpoint.
   */
  toggleOperations(id) {
    const operationIndex = this._openedOperations.indexOf(id);
    if (operationIndex !== -1) {
      this._openedOperations.splice(operationIndex, 1)
    } else {
      this._openedOperations.push(id)
    }
    this.requestUpdate();
  }

  /**
   * Updates the state of selected element when `selected` changes.
   *
   * @param {string} current New selection
   */
  _selectedChanged(current) {
    this._clearSelection();
    this._cleanPassiveSelection();
    if (current) {
      this._addSelection(current);
    }
  }

  /**
   * Label and method check against `query` function called by `dom-repeat`
   * element. This method uses `__effectiveQuery` property set by
   * `_flushQuery()` method.
   *
   * @param {MethodItem} item Model item with `label` property.
   * @return {boolean}
   */
  _methodFilter(item) {
    if (!this.__effectiveQuery) {
      return true;
    }
    return (
      (item.label || '').toLowerCase().indexOf(this.__effectiveQuery) !== -1 ||
      item.method.indexOf(this.__effectiveQuery) !== -1
    );
  }

  /**
   * When `query` property change it runs the filter function
   * in a debouncer set for ~50 ms.
   */
  _queryChanged() {
    if (this.__queryDebouncer) {
      return;
    }
    this.__queryDebouncer = true;
    setTimeout(() => {
      this._flushQuery();
      this.__queryDebouncer = false;
    });
  }

  /**
   * Calls `render()` function on each data repeater that have filterable
   * items.
   * It set's `__effectiveQuery` property on the element that is beyond
   * Polymer's data binding system so it skips 2 function calls each time
   * it is read. In a repeater filter function that can be a lot.
   *
   * Also the `__effectiveQuery` is transformed to perform text search.
   */
  _flushQuery() {
    let q = this.query;
    if (q) {
      q = q.toLowerCase();
    }
    this.__effectiveQuery = q;
  }

  /**
   * Dispatches `api-navigation-selection-changed` event on selection change.
   *
   * @param {string} selected Selected id
   * @param {string} selectedType Type of AMF shape
   */
  _selectionChanged(selected, selectedType) {
    if (!selectedType || this.__cancelNavigationEvent) {
      return;
    }
    let endpointId;
    if (selectedType === 'method' && selected) {
      const node = /** @type HTMLElement */ (this.shadowRoot.querySelector(
        `.operation[data-api-id="${selected}"]`
      ));
      if (node) {
        endpointId = node.dataset.parentId;
      }
    }
    const e = new CustomEvent('api-navigation-selection-changed', {
      bubbles: true,
      composed: true,
      detail: {
        selected,
        type: selectedType,
        endpointId,
      },
    });
    this.dispatchEvent(e);
  }

  /**
   * Navigation item click handler.
   * It used to be common function for all clicks inside the element
   * but in tests not all events were handled.
   *
   * @param {MouseEvent} e
   */
  _itemClickHandler(e) {
    const eTarget = /** @type HTMLElement */ (e.target);
    let target;
    if (e.currentTarget) {
      target = /** @type HTMLElement */ (e.currentTarget);
    } else if (eTarget.classList.contains('method-label')) {
      target = /** @type HTMLElement */ (eTarget.parentNode);
    } else {
      target = eTarget;
    }
    this._selectItem(target);
  }

  /**
   * Handler for `api-navigation-selection-changed`. Updates the selection
   * if dispatched from other element.
   * @param {CustomEvent} e
   */
  _navigationChangeHandler(e) {
    // @ts-ignore
    const path = (e.composedPath && e.composedPath()) || e.path;
    if (path[0] === this) {
      return;
    }
    this._cleanPassiveSelection();
    if (e.detail.passive === true) {
      this._handlePassiveNavigation(e.detail);
      return;
    }
    if (this.selected !== e.detail.selected) {
      this.__cancelNavigationEvent = true;
      this.selected = e.detail.selected;
      this.selectedType = e.detail.type;
      this.__cancelNavigationEvent = false;
    }
  }

  _handlePassiveNavigation(detail) {
    if (detail.type === 'method') {
      this._selectMethodPassive(detail.selected);
    }
  }

  _cleanPassiveSelection() {
    // Very simple optimization to not query local DOM if we are sure
    // that there's no selection.
    if (!this.__hasPassiveSelection) {
      return;
    }
    const nodes = this.shadowRoot.querySelectorAll('.passive-selected');
    for (let i = 0, len = nodes.length; i < len; i++) {
      nodes[i].classList.remove('passive-selected');
    }
    this.__hasPassiveSelection = false;
  }

  _selectMethodPassive(id) {
    const selector = `[data-api-id="${id}"]`;
    const node = this.shadowRoot.querySelector(selector);
    if (!node) {
      return;
    }
    node.classList.add('passive-selected');
    this.__hasPassiveSelection = true;
    const collapse = /** @type IronCollapseElement */ (node.parentElement);
    if (!collapse.opened) {
      collapse.opened = true;
    }
  }

  /**
   * Endpoint label click handler.
   * Toggles endpoint's methods list.
   *
   * @param {MouseEvent} e
   */
  _toggleEndpoint(e) {
    // @ts-ignore
    const path = (e.composedPath && e.composedPath()) || e.path;
    const test = true;
    while (test) {
      const node = path.shift();
      if (!node) {
        return;
      }
      if (node.nodeType !== 1) {
        continue;
      }
      if (!node.dataset.endpointId) {
        continue;
      }
      this.toggleOperations(node.dataset.endpointId);
      break;
    }
  }

  _toggleEndpointDocumentation(e) {
    if (!this.noOverview) {
      return this._toggleEndpoint(e)
    }
  }

  _toggleEndpointButton(e) {
    if (this.noOverview) {
      return this._toggleEndpoint(e)
    }
  }

  /**
   * Computes `style` attribute value for endpoint item.
   * It sets padding-left property to indent resources.
   * See https://github.com/mulesoft/api-console/issues/571.
   *
   * @param {Number} factor Computed indent factor for the resource
   * @param {Number} size The size of indentation in pixels.
   * @return {String} Style attribute value for the item.
   */
  _computeEndpointPadding(factor, size) {
    const padding = this._computeEndpointPaddingLeft();
    if (factor < 1) {
      return `padding-left: ${padding}px`;
    }
    const result = factor * size + padding;
    return `padding-left: ${result}px`;
  }

  _computeMethodPadding(factor, size) {
    const padding = this._computeOperationPaddingLeft();
    if (factor < 1) {
      return `padding-left: ${padding}px`;
    }
    const result = factor * size + padding;
    return `padding-left: ${result}px`;
  }

  /**
   * Computes operation list item left padding from CSS variables.
   * @return {Number}
   */
  _computeOperationPaddingLeft() {
    let paddingLeft;
    const prop = '--api-navigation-operation-item-padding-left';
    const defaultPadding = 24;
    // @ts-ignore
    if (window.ShadyCSS) {
      // @ts-ignore
      paddingLeft = window.ShadyCSS.getComputedStyleValue(this, prop);
    } else {
      paddingLeft = getComputedStyle(this).getPropertyValue(prop);
    }
    if (!paddingLeft) {
      return defaultPadding;
    }
    paddingLeft = paddingLeft.replace('px', '').trim();
    const result = Number(paddingLeft);
    if (Number.isNaN(result)) {
      return defaultPadding;
    }
    return result;
  }

  /**
   * Computes endpoint list item left padding from CSS variables.
   * @return {Number}
   */
  _computeEndpointPaddingLeft() {
    let padding;
    const prop = '--api-navigation-list-item-padding';
    const defaultPadding = 16;
    // @ts-ignore
    if (window.ShadyCSS) {
      // @ts-ignore
      padding = window.ShadyCSS.getComputedStyleValue(this, prop);
    } else {
      padding = getComputedStyle(this).getPropertyValue(prop);
    }
    if (!padding) {
      return defaultPadding;
    }
    const parts = padding.split(' ');
    let paddingLeftValue;
    switch (parts.length) {
      case 1:
        paddingLeftValue = parts[0];
        break;
      case 2:
        paddingLeftValue = parts[1];
        break;
      case 3:
        paddingLeftValue = parts[1];
        break;
      case 4:
        paddingLeftValue = parts[3];
        break;
      default:
        return defaultPadding;
    }
    if (!paddingLeftValue) {
      return defaultPadding;
    }
    paddingLeftValue = paddingLeftValue.replace('px', '').trim();
    const result = Number(paddingLeftValue);
    if (Number.isNaN(result)) {
      return defaultPadding;
    }
    return result;
  }

  /**
   * Updates value of `amf` from `raml-aware`'s api property change.
   * @param {CustomEvent} e
   */
  _awareApiChanged(e) {
    this.amf = e.detail.value;
  }

  /**
   * Returns filtered list of items to render in the menu list.
   * When `query` is set it tests `label` property of each item if it contains
   * the query. Otherwise it returns all items.
   * @param {string} prop Name of the source property keeping array values to render.
   * @returns {Array<TypeItem|DocumentationItem|SecurityItem|EndpointItem>|undefined}
   */
  _getFilteredType(prop) {
    const value = this[prop];
    if (!value || !value.length) {
      return undefined;
    }
    const q = this.__effectiveQuery;
    if (!q) {
      return value;
    }
    return value.filter(item => {
      if (typeof item.label !== 'string') {
        return false;
      }
      return item.label.toLowerCase().indexOf(q) !== -1;
    });
  }

  /**
   * Returns a list of endpoints to render.
   * When `query` is set it returns filtered list of endpoints for given query.
   * Otherwise it returns all endpoints.
   * @returns {EndpointItem[]|undefined} Filtered list of endpoints
   */
  _getFilteredEndpoints() {
    const value = this._endpoints;
    if (!value || !value.length) {
      return undefined;
    }
    const q = this.__effectiveQuery;
    if (!q) {
      return value;
    }

    const result = [];
    for (let i = 0, len = value.length; i < len; i++) {
      const endpoint = value[i];
      // If the endpoint's path or label matches the query include whole item
      if (
        (endpoint.path || '').toLowerCase().indexOf(q) !== -1 ||
        (endpoint.label || '').toLowerCase().indexOf(q) !== -1
      ) {
        result[result.length] = endpoint;
        continue;
      }
      // otherwise check all methods and only include matched methods. If none match
      // then do not include endpoint.
      const eMethods = endpoint.methods;
      if (!eMethods || !eMethods.length) {
        continue;
      }
      const methods = [];
      for (let j = 0, mLen = eMethods.length; j < mLen; j++) {
        const method = eMethods[j];
        if (
          (method.label || '').toLowerCase().indexOf(q) !== -1 ||
          method.method.indexOf(q) !== -1
        ) {
          methods[methods.length] = method;
        }
      }
      if (methods.length) {
        const copy = { ...endpoint };
        copy.methods = methods;
        result[result.length] = copy;
      }
    }
    return result;
  }

  /**
   * Closes all `anypoint-collapse` elements
   */
  _closeCollapses() {
    if (this._openedOperations.length > 0) {
      this._openedOperations = [];
      this.requestUpdate();
    }
  }

  /**
   * A handler for the focus event on this element.
   * @param {FocusEvent} e
   */
  _focusHandler(e) {
    if (this._shiftTabPressed) {
      // do not focus the menu itself
      return;
    }
    // @ts-ignore
    const path = (e.composedPath && e.composedPath()) || e.path;
    const rootTarget = path[0];
    if (
      rootTarget !== this &&
      typeof rootTarget.tabIndex !== 'undefined' &&
      !this.contains(rootTarget)
    ) {
      return;
    }
    this._focusedItem = null;
    if (this.selectedItem) {
      this.selectedItem.focus();
      this._focusedItem = this.selectedItem;
    } else {
      this.focusNext();
    }
  }

  /**
   * Focuses on the previous item in the navigation.
   */
  focusPrevious() {
    const items = this._listActiveItems();
    const { length } = items;
    const curFocusIndex = items.indexOf(this._focusedItem);
    for (let i = 1; i < length + 1; i++) {
      const item = items[(curFocusIndex - i + length) % length];
      if (!item.hasAttribute('disabled')) {
        const owner = (item.getRootNode && item.getRootNode()) || document;
        this._focusedItem = item;
        // Focus might not have worked, if the element was hidden or not
        // focusable. In that case, try again.
        // @ts-ignore
        if (owner.activeElement === item) {
          return;
        }
      }
    }
  }

  /**
   * Focuses on the next item in the navigation.
   */
  focusNext() {
    const items = this._listActiveItems();
    const { length } = items;
    const curFocusIndex = items.indexOf(this._focusedItem);
    for (let i = 1; i < length + 1; i++) {
      const item = items[(curFocusIndex + i) % length];
      if (!item.hasAttribute('disabled')) {
        const owner = (item.getRootNode && item.getRootNode()) || document;
        this._focusedItem = item;
        // Focus might not have worked, if the element was hidden or not
        // focusable. In that case, try again.
        // @ts-ignore
        if (owner.activeElement === item) {
          return;
        }
      }
    }
  }

  /**
   * Resets all tabindex attributes to the appropriate value based on the
   * current selection state. The appropriate value is `0` (focusable) for
   * the default selected item, and `-1` (not keyboard focusable) for all
   * other items. Also sets the correct initial values for aria-selected
   * attribute, true for default selected item and false for others.
   */
  _resetTabindices() {
    const { selectedItem } = this;
    const items = this._listActiveItems();
    items.forEach(item => {
      item.setAttribute('tabindex', item === selectedItem ? '0' : '-1');
    });
  }

  /**
   * Lists all HTML elements that are currently rendered in the view.
   * @return {Element[]} Currently rendered items.
   */
  _listActiveItems() {
    if (this._items) {
      return this._items;
    }
    let result = [];
    if (this.summary) {
      const node = this.shadowRoot.querySelector('.list-item.summary');
      if (node) {
        result[result.length] = node;
      }
    }
    if (this.hasEndpoints) {
      const node = this.shadowRoot.querySelector('.endpoints .section-title');
      if (node) {
        result[result.length] = node;
      }
      let nodes;
      if (this.noOverview) {
        nodes = this.shadowRoot.querySelectorAll(
          '.endpoints .list-item.endpoint .path-details,.endpoint-toggle-button'
        );
      } else {
        nodes = this.shadowRoot.querySelectorAll(
          '.endpoints .list-item.endpoint'
        );
      }
      for (let i = 0; i < nodes.length; i++) {
        const item = nodes[i];
        result[result.length] = item;
        const collapse = this.noOverview ? item.parentElement.nextElementSibling : item.nextElementSibling;
        if (collapse.localName !== 'anypoint-collapse') {
          continue;
        }
        if (!item.classList.contains('path-details')) {
          const children = collapse.querySelectorAll('.list-item.operation');
          if (children.length) {
            result = result.concat(Array.from(children));
          }
        }
      }
    }
    if (this.hasDocs) {
      const children = this._listSectionActiveNodes('.documentation');
      result = result.concat(Array.from(children));
    }
    if (this.hasTypes) {
      const children = this._listSectionActiveNodes('.types');
      result = result.concat(Array.from(children));
    }
    if (this.hasSecurity) {
      const children = this._listSectionActiveNodes('.security');
      result = result.concat(Array.from(children));
    }
    this._items = result.length ? result : undefined;
    return result;
  }

  /**
   * @param {string} selector The prefix for the query selector
   * @return {Element[]} Nodes returned from query function.
   */
  _listSectionActiveNodes(selector) {
    let result = [];
    const node = this.shadowRoot.querySelector(`${selector} .section-title`);
    if (node) {
      result[result.length] = node;
      const collapse = node.nextElementSibling;
      if (collapse) {
        const children = collapse.querySelectorAll('.list-item');
        if (children.length) {
          result = result.concat(Array.from(children));
        }
      }
    }
    return result;
  }

  /**
   * Handler for the keydown event.
   * @param {KeyboardEvent} e
   */
  _keydownHandler(e) {
    if (e.key === 'ArrowDown') {
      this._onDownKey(e);
    } else if (e.key === 'ArrowUp') {
      this._onUpKey(e);
    } else if (e.key === 'Tab' && e.shiftKey) {
      this._onShiftTabDown();
    } else if (e.key === 'Escape') {
      this._onEscKey();
    } else if (e.key === ' ' || e.code === 'Space') {
      this._onSpace(e);
    } else if (e.key === 'Enter' || e.key === 'NumpadEnter') {
      this._onSpace(e);
    }
    e.stopPropagation();
  }

  /**
   * Handler that is called when the up key is pressed.
   *
   * @param {KeyboardEvent} e A key combination event.
   */
  _onUpKey(e) {
    this.focusPrevious();
    e.preventDefault();
  }

  /**
   * Handler that is called when the down key is pressed.
   *
   * @param {KeyboardEvent} e A key combination event.
   */
  _onDownKey(e) {
    e.preventDefault();
    e.stopPropagation();
    this.focusNext();
  }

  /**
   * Handler that is called when the esc key is pressed.
   */
  _onEscKey() {
    const { focusedItem } = this;
    if (focusedItem) {
      focusedItem.blur();
    }
  }

  /**
   * A handler for the space bar key down.
   * @param {KeyboardEvent} e
   */
  _onSpace(e) {
    e.preventDefault();
    e.stopPropagation();
    // @ts-ignore
    const path = (e.composedPath && e.composedPath()) || e.path;
    const target = /** @type HTMLElement */ (path && path[0]);
    if (!target) {
      return;
    }
    const { classList } = target;
    if (classList.contains('section-title')) {
      this._toggleSection(target);
    } else if (
      classList.contains('list-item') &&
      classList.contains('endpoint')
    ) {
      this.toggleOperations(target.dataset.endpointId);
    } else if (classList.contains('list-item')) {
      this._selectItem(target);
    }
  }

  /**
   * Handler that is called when a shift+tab keypress is detected by the menu.
   */
  _onShiftTabDown() {
    const oldTabIndex = this.getAttribute('tabindex');
    this._shiftTabPressed = true;
    this._focusedItem = null;
    this.setAttribute('tabindex', '-1');
    setTimeout(() => {
      this.setAttribute('tabindex', oldTabIndex);
      this._shiftTabPressed = false;
    }, 1);
  }

  /**
   * Renders a template for endpoints and methods list.
   * @return {TemplateResult|string}
   */
  _endpointsTemplate() {
    if (!this.hasEndpoints) {
      return '';
    }
    const items = this._getFilteredEndpoints();
    if (!items || !items.length) {
      return '';
    }
    const toggleState = this.endpointsOpened ? 'Expanded' : 'Collapsed';

    const sectionLabel = this._isWebAPI(this.amf) ? 'Endpoints' : 'Channels';
    const lowercaseSectionLabel = sectionLabel.toLowerCase();

    return html` <section
      class="endpoints"
      ?data-opened="${this.endpointsOpened}"
    >
      <div
        class="section-title"
        data-section="endpoints"
        @click="${this._toggleSectionHandler}"
        title="Toggle ${lowercaseSectionLabel} list"
        aria-haspopup="true"
        role="menuitem"
      >
        <div class="title-h3">${sectionLabel}</div>
        <anypoint-icon-button
          part="toggle-button"
          class="toggle-button"
          aria-label="Toggle ${lowercaseSectionLabel}"
          .noink="${this.noink}"
          ?compatibility="${this.compatibility}"
          tabindex="-1"
          data-toggle="endpoints"
        >
          <span class="icon" aria-label="${toggleState}"
            >${keyboardArrowDown}</span
          >
        </anypoint-icon-button>
      </div>
      <anypoint-collapse
        .opened="${this.endpointsOpened}"
        aria-hidden="${this.endpointsOpened ? 'false' : 'true'}"
        role="menu"
      >
        <div class="children">
          ${items.map(item => this._endpointTemplate(item))}
        </div>
      </anypoint-collapse>
    </section>`;
  }

  /**
   * @param {EndpointItem} item
   * @return {TemplateResult} Template for an endpoint overview.
   */
  _overviewTemplate(item) {
    if (this.noOverview) {
      return '';
    }
    return html`<div
        part="api-navigation-list-item"
        class="list-item operation"
        role="menuitem"
        tabindex="0"
        data-api-id="${item.id}"
        data-shape="endpoint"
        data-endpoint-overview="${item.path}"
        @click="${this._itemClickHandler}"
        style="${this._computeMethodPadding(item.indent, this.indentSize)}"
        >
          Overview
        </div>`
  }

  /**
   * @param {EndpointItem} item
   * @return {TemplateResult} Template for an endpoint path.
   */
  _endpointPathTemplate(item) {
    const {noOverview} = this;

    return html`<div class="path-details">
        ${noOverview ?
      html`<div class="endpoint-name-overview" @click="${this._itemClickHandler}" data-api-id="${item.id}" data-shape="endpoint">${item.label}</div>`
      : html`<div class="endpoint-name">${item.label}</div>`}

        ${computeRenderPath(this.allowPaths, item.renderPath)
      ? html`<div class="path-name">${item.path}</div>`
      : undefined}
      </div>`;
  }

    /**
   * @param {EndpointItem} item
   * @return {TemplateResult} Template for an endpoint item.
   */
  _endpointTemplate(item) {
    const isEndpointOpened = this._openedOperations.includes(item.id);
    const ariaLabel = isEndpointOpened ? 'Expanded' : 'Collapsed';

    return html`<div
        part="api-navigation-list-item"
        class="list-item endpoint"
        data-endpoint-id="${item.id}"
        data-endpoint-path="${item.path}"
        @click="${this._toggleEndpointDocumentation}"
        title="Toggle endpoint documentation"
        style="${this._computeEndpointPadding(item.indent, this.indentSize)}"
        role="menuitem"
        aria-haspopup="true"
        ?endpoint-opened="${isEndpointOpened}"
      >
        ${this._endpointPathTemplate(item)}
        <anypoint-icon-button
          part="api-navigation-endpoint-toggle-button toggle-button"
          class="endpoint-toggle-button"
          aria-label="Toggle endpoint"
          .noink="${this.noink}"
          ?compatibility="${this.compatibility}"
          tabindex="-1"
          @click="${this._toggleEndpointButton}"
        >
          <span class="icon" aria-label="${ariaLabel}">${keyboardArrowDown}</span>
        </anypoint-icon-button>
      </div>
      <anypoint-collapse
        part="api-navigation-operation-collapse"
        class="operation-collapse"
        data-api-id="${item.id}"
        role="menu"
        .opened="${isEndpointOpened}"
        ?endpoint-opened="${isEndpointOpened}"
      >
        ${this._overviewTemplate(item)}
        ${item.methods.map(methodItem =>
          this._methodTemplate(item, methodItem)
        )}
      </anypoint-collapse>`;
  }

  /**
   * @param {EndpointItem} endpointItem
   * @param {MethodItem} methodItem
   * @return {TemplateResult}
   */
  _methodTemplate(endpointItem, methodItem) {
    const style = this._computeMethodPadding(
      endpointItem.indent,
      this.indentSize
    );
    return html`<div
      part="api-navigation-list-item"
      class="list-item operation"
      role="menuitem"
      tabindex="0"
      data-api-id="${methodItem.id}"
      data-parent-id="${endpointItem.id}"
      data-shape="method"
      @click="${this._itemClickHandler}"
      style="${style}"
    >
      <span class="method-label" data-method="${methodItem.method}"
        >${methodItem.method}</span
      >
      ${methodItem.label}
    </div>`;
  }

  /**
   * Renders a template for documentation list.
   * @return {TemplateResult|string}
   */
  _documentationTemplate() {
    if (!this.hasDocs) {
      return '';
    }
    const items = /** @type DocumentationItem[] */ (this._getFilteredType(
      '_docs'
    ));
    if (!items || !items.length) {
      return '';
    }
    const toggleState = this.docsOpened ? 'Expanded' : 'Collapsed';

    return html`
      <section class="documentation" ?data-opened="${this.docsOpened}">
        <div
          class="section-title"
          data-section="docs"
          @click="${this._toggleSectionHandler}"
          title="Toggle documentation list"
        >
          <div class="title-h3">Documentation</div>
          <anypoint-icon-button
            part="toggle-button"
            class="toggle-button"
            noink="${this.noink}"
            @click="${this._itemClickHandler}"
            aria-label="Toggle documents"
            ?compatibility="${this.compatibility}"
            tabindex="-1"
          >
            <span class="icon" aria-label="${toggleState}"
              >${keyboardArrowDown}</span
            >
          </anypoint-icon-button>
        </div>
        <anypoint-collapse .opened="${this.docsOpened}">
          <div class="children">
            ${items.map(item => this._documentationItemTemplate(item))}
          </div>
        </anypoint-collapse>
      </section>
    `;
  }

  /**
   * @param {DocumentationItem} item
   * @return {TemplateResult} Template for an docs item
   */
  _documentationItemTemplate(item) {
    if (item.isExternal) {
      return html`<a
        href="${item.url}"
        target="_blank"
        part="api-navigation-list-item"
        class="list-item"
        tabindex="0"
        data-api-id="${item.id}"
        data-shape="documentation"
      >
        ${item.label}
        <span class="icon new-tab" title="Opens in a new tab"
          >${openInNew}</span
        >
      </a>`;
    }
    return html`<div
      part="api-navigation-list-item"
      class="list-item"
      role="menuitem"
      tabindex="0"
      data-api-id="${item.id}"
      data-shape="documentation"
      @click="${this._itemClickHandler}"
    >
      ${item.label}
    </div>`;
  }

  /**
   * Renders a template for types list.
   * @return {TemplateResult|string}
   */
  _typesTemplate() {
    if (!this.hasTypes) {
      return '';
    }
    const items = this._getFilteredType('_types');
    if (!items || !items.length) {
      return '';
    }
    const toggleState = this.typesOpened ? 'Expanded' : 'Collapsed';

    return html`
      <section class="types" ?data-opened="${this.typesOpened}">
        <div
          class="section-title"
          data-section="types"
          @click="${this._toggleSectionHandler}"
          title="Toggle types list"
        >
          <div class="title-h3">Types</div>
          <anypoint-icon-button
            part="toggle-button"
            class="toggle-button"
            noink="${this.noink}"
            aria-label="Toggle types"
            ?compatibility="${this.compatibility}"
            tabindex="-1"
            data-toggle="types"
          >
            <span class="icon" aria-label="${toggleState}"
              >${keyboardArrowDown}</span
            >
          </anypoint-icon-button>
        </div>
        <anypoint-collapse .opened="${this.typesOpened}">
          <div class="children">
            ${items.map(
              item =>
                html`<div
                  part="api-navigation-list-item"
                  class="list-item"
                  role="menuitem"
                  tabindex="0"
                  data-api-id="${item.id}"
                  data-shape="type"
                  data-type-name="${item.label}"
                  @click="${this._itemClickHandler}"
                >
                  ${item.label}
                </div>`
            )}
          </div>
        </anypoint-collapse>
      </section>
    `;
  }

  /**
   * @return {TemplateResult|string} template for security schemes list.
   */
  _securityTemplate() {
    if (!this.hasSecurity) {
      return '';
    }
    const items = this._getFilteredType('_security');
    if (!items || !items.length) {
      return '';
    }
    const toggleState = this.securityOpened ? 'Expanded' : 'Collapsed';

    return html` <section
      class="security"
      ?data-opened="${this.securityOpened}"
    >
      <div
        class="section-title"
        data-section="security"
        @click="${this._toggleSectionHandler}"
        title="Toggle security list"
      >
        <div class="title-h3">Security</div>
        <anypoint-icon-button
          part="toggle-button"
          class="toggle-button"
          noink="${this.noink}"
          aria-label="Toggle security"
          ?compatibility="${this.compatibility}"
          tabindex="-1"
          data-toggle="security"
        >
          <span class="icon" aria-label="${toggleState}"
            >${keyboardArrowDown}</span
          >
        </anypoint-icon-button>
      </div>
      <anypoint-collapse .opened="${this.securityOpened}">
        <div class="children">
          ${items.map(
            item => html`<div
              part="api-navigation-list-item"
              class="list-item"
              role="menuitem"
              tabindex="0"
              data-api-id="${item.id}"
              data-shape="security"
              data-security-name="${item.label}"
              @click="${this._itemClickHandler}"
            >
              ${item.label}
            </div>`
          )}
        </div>
      </anypoint-collapse>
    </section>`;
  }

  /**
   * @return {TemplateResult|string} Template for `raml-aware`
   */
  _awareTemplate() {
    const { aware } = this;
    if (!aware) {
      return '';
    }
    return html`<raml-aware
      .scope="${aware}"
      @api-changed="${this._awareApiChanged}"
    ></raml-aware>`;
  }

  render() {
    const { styles, _renderSummary, summaryLabel } = this;
    return html`<style>
        ${styles}
      </style>
      ${this._awareTemplate()}
      <div class="wrapper" role="menu" aria-label="Navigate the API">
        ${_renderSummary
          ? html` <section class="summary">
              <div
                part="api-navigation-list-item"
                class="list-item summary"
                role="menuitem"
                tabindex="0"
                data-api-id="summary"
                data-shape="summary"
                @click="${this._itemClickHandler}"
              >
                ${summaryLabel}
              </div>
            </section>`
          : undefined}
        ${this._endpointsTemplate()} ${this._documentationTemplate()}
        ${this._typesTemplate()} ${this._securityTemplate()}
      </div> `;
  }
  /**
   * Dispatched when navigation occurs.
   * It ensures that `type` property is always set when selection changes
   * (selection type changes later than the selection but within the same
   * microtask).
   *
   * @event api-navigation-selection-changed
   * @param {String} selected `@id` of selected AMF shape
   * @param {String=} endpointId Available only if `type` is `method`.
   * It is parent endpoint ID.
   * @param {String} type The type of selected shape. It can be one of
   * `documentation`, `type`, `security`, `endpoint`, `method` or `summary`.
   * Summary is a special case not included in AMF model but means that the
   * user requested API summary view (start screen).
   * @param {Boolean} passive If true then the event wasn't caused by user
   * intentional interaction and regular navigation action should not occur.
   */
}
