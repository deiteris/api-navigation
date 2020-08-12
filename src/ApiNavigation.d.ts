import {LitElement, TemplateResult, CSSResult} from 'lit-element';

import {AmfHelperMixin} from '@api-components/amf-helper-mixin/amf-helper-mixin.js';

declare interface ModelItem {
  /**
   * A label to render in the menu list item
   */
  label: string;
  /**
   * The AMF `@id` associated with the label.
   */
  id: string;
}

declare interface MethodItem extends ModelItem {
  method: string;
}

declare interface EndpointItem extends ModelItem {
  indent: number;
  methods: MethodItem[];
  renderPath: boolean;
  path: string;
}

declare interface SecurityItem extends ModelItem {
}

declare interface TypeItem extends ModelItem {
}

declare interface DocumentationItem extends ModelItem {
  /**
   * When set the documentation item refers to an external document
   */
  isExternal: boolean;
  /**
   * Only set when `isExternal` equals `true`.
   * An URL for the external documentation.
   */
  url?: string;
}

declare interface TargetModel {
  documentation?: DocumentationItem[];
  types?: TypeItem[];
  securitySchemes?: SecurityItem[];
  endpoints?: EndpointItem[];
  _typeIds?: string[];
  _basePaths?: string[];
}

/**
 * Computes label for an endpoint when name is missing and the endpoint
 * is indented, hence name should be truncated.
 *
 * @param currentPath Endpoint's path
 * @param parts Path parts
 * @param indent Endpoint indentation
 * @param basePaths List of base paths already used.
 * @returns Name of the path to render.
 */
export declare function computePathName(currentPath: string, parts: string[], indent: number, basePaths: Array<string>): string;


/**
 * Computes condition value to render path label.
 *
 * @param allowPaths Component configuration property.
 * @param renderPath Endpoint property
 * @returns True if both arguments are truly.
 */
export declare function computeRenderPath(allowPaths: boolean, renderPath: boolean): boolean;

/**
 * `api-navigation`
 * A navigation for an API spec using AMF model.
 *
 * This element is to replace deprecated `raml-path-selector`.
 * It is lightweight and much less complex in comparision.
 *
 * The element works with [AMF](https://github.com/mulesoft/amf)
 * json/ld model. When the model is set it computes list of documentation
 * nodes, types, endpoints, mathods and security schemas.
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
 * Once the `raml-aware` element receives some that they are instantly
 * transfered to `api-navigation`.
 *
 * Note, this element does not contain polyfills for Array platform features.
 * Use `arc-polyfills` to add support for IE and Safari 9.
 *
 * ## Passive navigation
 *
 * Passive navigation means that a navigation event occured but it wasn't
 * invoked by intentional user interaction. For example
 * `api-endpoint-documentation` component renders list of documentations for
 * HTTP methods. While scrolling through the list navigation context
 * changes (user reads documentation of a method) but the navigation never
 * was caused by user intentional interaction.
 * This event, annotated with `passive: true` property in the detail object
 * prohibits other element from taking a navigation action but some
 * may reflect the change in the UI.
 *
 * ## Styling
 *
 * Custom property | Description | Default
 * ----------------|-------------|----------
 * `--api-navigation-header-color` | Color of section title | `rgba(0, 0, 0, 0.84)`
 * `--api-navigation-section-title-background-color` | Background color of the section title | `inherit`
 * `--api-navigation-list-item-min-height` | Minimum heigtht of menu items. Note that each item has top and bottom padding set to 4px which cobines to default 48px. | `40px`
 * `--api-navigation-list-item-color` | Color of the menu items | `rgba(0, 0, 0, 0.84)`
 * `--api-navigation-list-item-selected-weight` | Font weight of selected menu item | `bold`
 * `--api-navigation-list-item-selected-background-color` | Background color of selected menu item | `--accent-color`
 * `--api-navigation-list-item-selected-color` | Color of selected menu item | `#fff`
 * `--api-navigation-list-item-disabled-color` | Color of disabled menu item. Currently not in use. | `--disabled-text-color`
 * `--api-navigation-list-item-word-break` | Word break of menu item. | `break-all`
 * `--api-navigation-toggle-icon-color` | Color of the toggle button next to section title | `rgba(0, 0, 0, 0.74)`
 * `--api-navigation-toggle-icon-hover-color` | Color of the toggle button next to section title when hovering. | `--secondary-button-color` or `rgba(0, 0, 0, 0.88)`
 * `--api-navigation-endpoint-toggle-icon-color` | Colot of endpoint toggle button | `--api-navigation-toggle-icon-color` or `rgba(0, 0, 0, 0.74)`
 * `--method-display-get-color` | Font color of the GET method label box | `rgb(0, 128, 0)`
 * `--method-display-post-color` | Font color of the POST method label box | `rgb(33, 150, 243)`
 * `--method-display-put-color` | Font color of the PUT method label box | `rgb(255, 165, 0)`
 * `--method-display-delete-color` | Font color of the DELETE method label box | `rgb(244, 67, 54)`
 * `--method-display-patch-color` | Font color of the PATCH method label box | `rgb(156, 39, 176)`
 * `--api-navigation-operation-item-padding-left` | Padding left of operation (method) label under endpoint | `20px`
 * `--api-navigation-operation-collapse` | Mixin applied to operation list collapsable element | ``
 * `--api-navigation-list-section-font-size` | Font size of toggable section label | `16px`
 * `--api-navigation-endpoint-font-size` | Font size applied to endpoint label | `15px`
 * `--api-navigation-operation-font-size` | Font size of operation (HTTP method) label | `14px`
 * `--api-navigation-list-item-padding` | Padding of list a item | `4px 16px`
 * `--api-navigation-method-label-color` | Color of the HTTP method label | `#000`
 * `--api-navigation-method-label-background-color` | Background color of the HTTP method label | `transparent`
 * `--method-display-font-weigth` | Font weight of HTTP label | `400`
 * `--method-label-VERB-background-color` | Background color of HTTP method label. Possible verbs are: `get`, `post`, `put`, `delete`, `patch` | `vary`
 * `--method-label-VERB-color` | Color of HTTP method label. Possible verbs are: `get`, `post`, `put`, `delete`, `patch` | `vary`
 * `--api-navigation-operation-endpoint-opened-background-color` | Background color of opened methods list | `inherit`
 * `--api-navigation-path-label-font-size` | Path label font size | `13px`
 * `--api-navigation-path-label-color` | Path label font color | `#616161`
 * `--api-navigation-endpoint-toggle-icon-width` | | `32px`
 * `--api-navigation-endpoint-toggle-icon-height` | | `32px`
 * `--api-navigation-endpoint-toggle-icon-margin-right` | | ``
 * `--api-navigation-background-color` | Navigation element background color | `inherit`
 * `--api-navigation-color` | Navigation element color | `inherit`
 * `--arc-font-body1-font-size` | | `inherit`
 * `--arc-font-body1-font-weight` | | `inherit`
 * `--arc-font-body1-line-height` | | `inherit`
 */
export declare class ApiNavigation {
  readonly styles: CSSResult[];

  /**
   * `raml-aware` scope property to use.
   */
  aware: string|undefined;

  /**
   * A model `@id` of selected documentation part.
   * Special case is for `summary` view. It's not part of an API
   * but most applications has some kins of summary view for the
   * API.
   */
  selected: string|undefined;

  /**
   * Type of the selected item.
   * One of `documentation`, `type`, `security`, `endpoint`, `method`
   * or `summary`.
   *
   * This property is set after `selected` property.
   */
  selectedType: string|undefined;

  /**
   * If set it renders `API summary` menu option.
   * It will allow to set `selected` and `selectedType` to `summary`
   * when this option is set.
   */
  summary: boolean;

  /**
   * A label for the `summary` section.
   * @default "Summary"
   */
  summaryLabel: string;

  /**
   * Computed list of documentation items in the API.
   */
  _docs: DocumentationItem[]|undefined;

  /**
   * Determines and changes state of documentation panel.
   */
  docsOpened: boolean|null|undefined;

  /**
   * Computed list of "type" items in the API.
   */
  _types: TypeItem[]|undefined;

  /**
   * Determines and changes state of types panel.
   */
  typesOpened: boolean|null|undefined;

  /**
   * Computed list of Security schemes items in the API.
   */
  _security: SecurityItem[]|undefined;

  /**
   * Determines and changes state of security panel.
   */
  securityOpened: boolean|undefined;

  /**
   * Computed list of endpoint items in the API.
   */
  _endpoints: EndpointItem[]|undefined;

  /**
   * Determines and changes state of endpoints panel.
   */
  endpointsOpened: boolean|undefined;

  /**
   * If true, the element will not produce a ripple effect when interacted with via the pointer.
   */
  noink: boolean;

  /**
   * Filters list elements by this value when set.
   * Clear the value to reset the search.
   *
   * This is not currently exposed in element's UI due
   * to complexity of search and performance.
   */
  query: string|undefined;

  /**
   * Size of endpoint indentation for nested resources.
   * In pixels.
   *
   * The attribute name for this property is `indent-size`. Note, that this
   * will change to web consistant name `indentsize` in the future.
   */
  indentSize: number|null|undefined;

  /**
   * Flag set when passed AMF model is a RAML fragment.
   */
  _isFragment: boolean|null|undefined;

  /**
   * When set it renders full path below endpoint name if the endpoint has
   * a name (different than the path).
   * This is not always recommended to use this option as some complex APIs
   * may render this component difficult to understand.
   */
  allowPaths: boolean;

  /**
   * If this value is set, then the navigation component will sort the list
   * of endpoints based on the `path` value of the endpoint, keeping the order
   * of which endpoint was first in the list, relative to each other
   */
  rearrangeEndpoints: boolean;

  /**
   * Enables compatibility with Anypoint components.
   */
  compatibility: boolean;

  /**
   * true when `_docs` property is set with values
   */
  readonly hasDocs: boolean;

  /**
   * true when `_types` property is set with values
   */
  readonly hasTypes: boolean;

  /**
   * true when `_security` property is set with values
   */
  readonly hasSecurity: boolean;

  /**
   * true when `_endpoints` property is set with values
   */
  readonly hasEndpoints: boolean;
  /**
   * True when summary should be rendered.
   * Summary should be rendered only when `summary` is set and
   * current model is not a RAML fragment.
   */
  readonly _renderSummary: boolean;

  /**
   * The currently selected item.
   */
  readonly selectedItem: HTMLElement|null;
  /**
   * The currently focused item.
   */
  readonly focusedItem: HTMLElement|null;

  /**
   * Ensures aria role atribute is in place.
   * Attaches element's listeners.
   */
  connectedCallback(): void;
  disconnectedCallback(): void;

  /**
   * Collects the information about the API and creates data model
   * for the navigation element
   *
   * @returns Data model for the API navigation
   */
  _collectData(model: object): TargetModel;

  /**
   * Collects the data from the security fragment
   *
   * @param model Security fragment model
   */
  _collectSecurityData(model: object): TargetModel|undefined;

  /**
   * Collects the data from the documentation fragment
   *
   * @param model Documentation fragment model
   */
  _collectDocumentationData(model: object): TargetModel|undefined;

  /**
   * Collects the data from the type fragment
   *
   * @param model Type fragment model
   */
  _collectTypeData(model: object): TargetModel|undefined;

  /**
   * Traverses the `http://raml.org/vocabularies/document#declares`
   * node to find types and security schemes.
   *
   * @param target Target object where to put data.
   */
  _traverseDeclarations(model: object, target: TargetModel): void;

  /**
   * Traverses the `http://raml.org/vocabularies/document#references`
   *
   * @param model AMF model
   * @param target Target object where to put data.
   */
  _traverseReferences(model: object, target: TargetModel): void;

  /**
   * Traverses the `http://raml.org/vocabularies/document#encodes`
   * node to find documentation and endpoints.
   *
   * @param target Target object where to put data.
   */
  _traverseEncodes(model: object, target: TargetModel): void;

  /**
   * Re-arrange the endpoints in relative order to each other, keeping
   * the first endpoints to appear first, and the last endpoints to appear
   * last
   */
  _rearrangeEndpoints(endpoints: EndpointItem[]): EndpointItem[];

  /**
   * Transforms a list of endpoints into a map that goes from
   * string -> Object[], representing the first part of the endpoint
   * path, and the list of endpoints that match it. The idea is
   * to have a map for this, respecting the order each
   * endpoint is first found at, so that re-arranging the
   * endpoints keeps them in the same relative order to each
   * other
   */
  _createListMap(endpoints: EndpointItem[]): object;

  /**
   * Appends declaration of navigation data model to the target if
   * it matches documentation or security types.
   */
  _appendModelItem(item: object, target: TargetModel): void;

  /**
   * Appends "type" item to the results.
   *
   * @param item Type item declaration
   */
  _appendTypeItem(item: object, target: TargetModel): void;

  /**
   * Appends "security" item to the results.
   *
   * @param item Type item declaration
   */
  _appendSecurityItem(item: object, target: TargetModel): void;

  /**
   * Appends "documentation" item to the results.
   *
   * @param item Type item declaration
   */
  _appendDocumentationItem(item: object, target: TargetModel): void;

  /**
   * Appends "endpoint" item to the results.
   * This also iterates over methods to extract method data.
   *
   * @param item Endpoint item declaration
   */
  _appendEndpointItem(item: object, target: TargetModel): void;

  /**
   * Creates the view model for an opration.
   *
   * @param item Operation AMF model
   * @returns Method view model
   */
  _createOperationModel(item: object): MethodItem;

  /**
   * Click handler for section name item.
   * Toggles the view.
   */
  _toggleSectionHandler(e: MouseEvent): void;
  _toggleSection(node: HTMLElement): void;

  /**
   * Selectes new item in the menu.
   */
  _selectItem(node: HTMLElement): void;

  /**
   * Toggles selection state of a node that has `data-api-id` set to
   * `id`.
   *
   * @param id Selected node id.
   * @returns Type of selected node.
   */
  _addSelection(id: string): string|undefined;

  /**
   * Removes any current selection that may exist.
   */
  _clearSelection(): void;

  /**
   * Toggles endpoint operations list.
   *
   * @param id ID of the endpoint.
   */
  toggleOperations(id: string): void;

  /**
   * Updates the state of selected element when `selected` changes.
   *
   * @param current New selection
   */
  _selectedChangd(current: string): void;

  /**
   * Label and method check agains `query` function called by `dom-repeat`
   * element. This method uses `__effectiveQuery` property set by
   * `_flushQuery()` method.
   *
   * @param item Model item with `lable` property.
   */
  _methodFilter(item: MethodItem): boolean;

  /**
   * When `query` property change it runs the filter function
   * in a debouncer set for ~50 ms.
   */
  _queryChanged(): void;

  /**
   * Calles `render()` function on each data repeater that have filterable
   * items.
   * It set's `__effectiveQuery` property on the element that is beyond
   * Polymer's data binding system so it skips 2 function calls each time
   * it is read. In a repeater filter function that can be a lot.
   *
   * Also the `__effectiveQuery` is transformed to perform text search.
   */
  _flushQuery(): void;

  /**
   * Dispatches `api-navigation-selection-changed` event on selection change.
   *
   * @param selected Selected id
   * @param selectedType Type of AMF shape
   */
  _selectionChnaged(selected: string, selectedType: string): void;

  /**
   * Navigation item click handler.
   * It used to be common function for all clicks inside the element
   * but in tests not all events were handled.
   */
  _itemClickHandler(e: MouseEvent): void;

  /**
   * Handler for `api-navigation-selection-changed`. Updates the selection
   * if dispatched from other element.
   */
  _navigationChangeHandler(e: CustomEvent): void;
  _handlePassiveNavigation(detail: object): void;
  _cleanPassiveSelection(): void;
  _selectMethodPassive(id: string): void;

  /**
   * Endpoint label click handler.
   * Toggles endpoint's methods list.
   */
  _toggleEndpoint(e: MouseEvent): void;

  /**
   * Computes `style` attribute value for endpoint item.
   * It sets padding-left property to indent resources.
   * See https://github.com/mulesoft/api-console/issues/571.
   *
   * @param factor Computed indent factor for the resource
   * @param size The size of indentation in pixels.
   * @returns Style attribute value for the item.
   */
  _computeEndpointPadding(factor: Number, size: Number): String;
  _computeMethodPadding(factor: Number, size: Number): string;

  /**
   * Computes operation list item left padding from CSS veriables.
   */
  _computeOperationPaddingLeft(): Number;

  /**
   * Computes endpoint list item left padding from CSS veriables.
   */
  _computeEndpointPaddingLeft(): Number;

  /**
   * Updates value of `amf` from `raml-aware`'s api property change.
   */
  _awareApiChanged(e: CustomEvent): void;

  /**
   * Returns filtered list of items to render in the menu list.
   * When `query` is set it tests `label` property of each item if it contains
   * the query. Otherwise it returns all items.
   *
   * @param prop Name of the source property keeping array values to render.
   */
  _getFilteredType(prop: string): Array<TypeItem|DocumentationItem|SecurityItem|EndpointItem>|undefined;

  /**
   * Returns a list of endpoints to render.
   * When `query` is set it returns filtered list of endpoints for given query.
   * Othewise it returns all endpoints.
   *
   * @returns Filtered list of endpoints
   */
  _getFilteredEndpoints(): EndpointItem[]|undefined;

  /**
   * Closes all `iron-collapse` elements
   */
  _closeCollapses(): void;

  /**
   * A handler for the focus event on this element.
   */
  _focusHandler(e: FocusEvent): void;

  /**
   * Focuses on the previous item in the navigation.
   */
  focusPrevious(): void;

  /**
   * Focuses on the next item in the navigation.
   */
  focusNext(): void;

  /**
   * Resets all tabindex attributes to the appropriate value based on the
   * current selection state. The appropriate value is `0` (focusable) for
   * the default selected item, and `-1` (not keyboard focusable) for all
   * other items. Also sets the correct initial values for aria-selected
   * attribute, true for default selected item and false for others.
   */
  _resetTabindices(): void;

  /**
   * Lists all HTML elements that are currently rendered in the view.
   * @returns Currently rendered items.
   */
  _listActiveItems(): Element[];

  /**
   * @param selector The prefix for the query selector
   * @returns Nodes returned from query function.
   */
  _listSectionActiveNodes(selector: string): Element[];

  /**
   * Handler for the keydown event.
   */
  _keydownHandler(e: KeyboardEvent): void;

  /**
   * Handler that is called when the up key is pressed.
   *
   * @param e A key combination event.
   */
  _onUpKey(e: KeyboardEvent): void;

  /**
   * Handler that is called when the down key is pressed.
   *
   * @param e A key combination event.
   */
  _onDownKey(e: KeyboardEvent): void;

  /**
   * Handler that is called when the esc key is pressed.
   */
  _onEscKey(): void;

  /**
   * A handler for the spacebar key down.
   */
  _onSpace(e: KeyboardEvent): void;

  /**
   * Handler that is called when a shift+tab keypress is detected by the menu.
   */
  _onShiftTabDown(): void;

  /**
   * Renders a template for endpoints and methods list.
   */
  _endpointsTemplate(): TemplateResult|string;
  _endpointTemplate(item: EndpointItem): TemplateResult;
  _methodTemplate(endpointItem: EndpointItem, methodItem: MethodItem): TemplateResult;

  /**
   * Renders a template for documentation list.
   */
  _documentationTemplate(): TemplateResult|string;

  /**
   * @returns Template for an docs item
   */
  _documentationItemTemplate(item: DocumentationItem): TemplateResult;

  /**
   * Renders a template for types list.
   */
  _typesTemplate(): TemplateResult|string;

  /**
   * Renders a template for security schemes list.
   */
  _securityTemplate(): TemplateResult|string;

  /**
   * @return {TemplateResult} Template for `raml-aware`
   */
  _awareTemplate(): TemplateResult|string;
  render(): TemplateResult;
}

export interface ApiNavigation extends AmfHelperMixin, LitElement {
}
