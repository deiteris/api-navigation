(function(global) {
  const RAML_ROOT = 'http://raml.org/';
  const RAML_VOC = RAML_ROOT + 'vocabularies/';
  const RAML_DOC = RAML_VOC + 'document#';
  const RAML_HTTP = RAML_VOC + 'http#';
  const RAML_SEC = RAML_VOC + 'security#';
  const SHACL = 'http://www.w3.org/ns/shacl#';
  const SCHEMA_ORG = 'http://schema.org/';
  const SCHEMA_CREATIVE = SCHEMA_ORG + 'CreativeWork';
  const HYDRA = 'http://www.w3.org/ns/hydra/';
  const HYDRA_CORE = HYDRA + 'core#';

  /**
   * A helper class that extract useful for navigation information from
   * amf.
   */
  class ApiNavigationAmfHelper {
    /**
    * @constructor
     *
     * @param {Object|Array} amf AMF json/ld model
     */
    constructor(amf) {
      this.model = this.ensureAmfModel(amf);
      if (!this.model) {
        throw new Error('Passed model is not valid AMF Document');
      }
      this.baseId = this.model['@id'];
    }
    /**
     * Ensures that the model is AMF object.
     *
     * @param {Object|Array} amf AMF json/ld model
     * @return {Object|undefined} API spec
     */
    ensureAmfModel(amf) {
      if (!amf) {
        return;
      }
      if (amf instanceof Array) {
        amf = amf[0];
      }
      if (this.hasType(amf, RAML_DOC + 'Document')) {
        return amf;
      }
    }
    /**
     * Checks if given `model` has a `type`.
     *
     * @param {Object} model Model to test
     * @param {String} type Type to find
     * @return {Boolean} True if model has `type` defined.
     */
    hasType(model, type) {
      if (!model || !model['@type']) {
        return false;
      }
      const types = model['@type'];
      if (!(types instanceof Array)) {
        return false;
      }
      return !!types.find((item) => item === type);
    }
    /**
     * Collects the information about the API and creates data model
     * for the navigation element
     *
     * @return {Object} Data model for the API navigation:
     * - documentation `Array` - List of documentation data models:
     *  - id `String` - Node `@id`
     *  - label `String` - Node label
     * - types `Array` - List of types data models:
     *  - id `String` - Node `@id`
     *  - label `String` - Node label
     * - securitySchemes `Array` - List of security schemes data models:
     *  - id `String` - Node `@id`
     *  - label `String` - Node label
     * - endpoints `Array` - List of endpoints data models:
     *  - id `String` - Node `@id`
     *  - label `String` - Node label
     *  - methods `Array` - List of methonds data models in an endpoint:
     *    - id `String` - Node `@id`
     *    - label `String` - Node label
     */
    collect() {
      if (this._collecton) {
        return this._collecton;
      }
      const result = {
        documentation: [],
        types: [],
        securitySchemes: [],
        endpoints: []
      };
      this.traverseDeclarations(result);
      this.traverseEncodes(result);
      this._collecton = result;
      return result;
    }
    /**
     * Traverses the `http://raml.org/vocabularies/document#declares`
     * node to find types and security schemes.
     *
     * @param {Object} target Target object where to put data.
     */
    traverseDeclarations(target) {
      const model = this.model[RAML_DOC + 'declares'];
      if (!model || !model.length) {
        return;
      }
      model.forEach((item) => this._appendModelItem(item, target));
    }
    /**
     * Traverses the `http://raml.org/vocabularies/document#encodes`
     * node to find documentation and endpoints.
     *
     * @param {Object} target Target object where to put data.
     */
    traverseEncodes(target) {
      const model = this.model[RAML_DOC + 'encodes'];
      if (!model || !model.length) {
        return;
      }
      const id = this.baseId + '#/web-api';
      const data = model.find((item) => item['@id'] === id);
      if (!data) {
        return;
      }
      const endpoint = data[RAML_HTTP + 'endpoint'];
      if (endpoint) {
        endpoint.forEach((item) => this._appendModelItem(item, target));
      }
      const documentation = data[SCHEMA_ORG + 'documentation'];
      if (documentation) {
        documentation.forEach((item) => this._appendModelItem(item, target));
      }
    }
    /**
     * Appends declaration of navigation data model to the target if
     * it matches documentation or security types.
     *
     * @param {Object} item
     * @param {Object} target
     */
    _appendModelItem(item, target) {
      if (this.hasType(item, SHACL + 'Shape')) {
        this._appendTypeItem(item, target);
      } else if (this.hasType(item, RAML_SEC + 'SecurityScheme')) {
        this._appendSecurityItem(item, target);
      } else if (this.hasType(item, SCHEMA_CREATIVE)) {
        this._appendDocumentationItem(item, target);
      } else if (this.hasType(item, RAML_HTTP + 'EndPoint')) {
        this._appendEndpointItem(item, target);
      }
    }
    /**
     * Appends "type" item to the results.
     *
     * @param {Object} item Type item declaration
     * @param {Object} target
     */
    _appendTypeItem(item, target) {
      let name = this._computeSchemaProperty(item, 'name');
      if (!name) {
        name = this._computeShaclProperty(item, 'name');
      }
      const id = item['@id'];
      target.types.push({
        label: name,
        id: id
      });
    }
    /**
     * Appends "security" item to the results.
     *
     * @param {Object} item Type item declaration
     * @param {Object} target
     */
    _appendSecurityItem(item, target) {
      let name = this._computeSchemaProperty(item, 'displayName');
      if (!name) {
        name = this._computeProperty(item, RAML_SEC + 'name');
      }
      const id = item['@id'];
      target.securitySchemes.push({
        label: name,
        id: id
      });
    }
    /**
     * Appends "documentation" item to the results.
     *
     * @param {Object} item Type item declaration
     * @param {Object} target
     */
    _appendDocumentationItem(item, target) {
      const name = this._computeSchemaProperty(item, 'title');
      const id = item['@id'];
      target.documentation.push({
        label: name,
        id: id
      });
    }
    /**
     * Appends "endpoint" item to the results.
     * This also iterates over methods to extract method data.
     *
     * @param {Object} item Type item declaration
     * @param {Object} target
     */
    _appendEndpointItem(item, target) {
      let name = this._computeSchemaProperty(item, 'name');
      if (!name) {
        name = this._computeProperty(item, RAML_HTTP + 'path');
      }
      const id = item['@id'];
      const operations = item[HYDRA_CORE + 'supportedOperation'] || [];
      let methods = operations.map((op) => this._createOperationModel(op));
      target.endpoints.push({
        label: name,
        id: id,
        methods: methods
      });
    }
    /**
     * Creates the view model for an opration.
     *
     * @param {Object} item Operation AMF model
     * @return {Object} Method view model
     */
    _createOperationModel(item) {
      let name = this._computeSchemaProperty(item, 'name');
      if (!name) {
        name = this._computeProperty(item, HYDRA_CORE + 'method');
      }
      const id = item['@id'];
      const method = this._computeProperty(item, HYDRA_CORE + 'method');
      return {
        label: name,
        id: id,
        method: method
      };
    }
    /**
     * Computes the value of a property that namespace starts with
     * `http://www.w3.org/ns/shacl`.
     *
     * @param {Object} def Property AMF definition
     * @param {String} property Name of the schema.
     * @return {any|undefined} Value of the property or undefined if not set.
     */
    _computeShaclProperty(def, property) {
      const key = SHACL + property;
      return this._computeProperty(def, key);
    }
    /**
     * Computes the value of a property that namespace starts with
     * `http://schema.org/`.
     *
     * @param {Object} def Property AMF definition
     * @param {String} property Name of the schema.
     * @return {any|undefined} Value of the property or undefined if not set.
     */
    _computeSchemaProperty(def, property) {
      const key = SCHEMA_ORG + property;
      return this._computeProperty(def, key);
    }
    /**
     * Computes the value of a property.
     *
     * @param {Object} def Property AMF definition
     * @param {String} key Property name.
     * @return {any|undefined} Value of the property or undefined if not set.
     */
    _computeProperty(def, key) {
      const val = def[key];
      if (val) {
        return val[0]['@value'];
      }
    }
  }
  global.ApiNavigationAmfHelper = ApiNavigationAmfHelper;
})(window);
