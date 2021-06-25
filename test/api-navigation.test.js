import { fixture, assert, nextFrame, html, aTimeout } from '@open-wc/testing';
import * as MockInteractions from '@polymer/iron-test-helpers/mock-interactions.js';
import * as sinon from 'sinon';
import { AmfLoader } from './amf-loader.js';
import { AmfHelper } from './amf-helper.js';
import '../api-navigation.js';
import { computePathName, computeRenderPath } from '../src/ApiNavigation.js';

/* eslint-disable no-plusplus */

/** @typedef {import('../').ApiNavigation} ApiNavigation */
/** @typedef {import('@anypoint-web-components/anypoint-collapse').AnypointCollapseElement} AnypointCollapseElement */

describe('<api-navigation>', () => {
  const asyncApi = 'async-api';
  const unorderedEndpoints = 'unordered-endpoints';

  /**
   * @returns {Promise<ApiNavigation>}
   */
  async function basicFixture() {
    return fixture(html`<api-navigation></api-navigation>`);
  }

  /**
   * @returns {Promise<ApiNavigation>}
   */
  async function summaryFixture() {
    return fixture(html`<api-navigation summary></api-navigation>`);
  }

  /**
   * @returns {Promise<ApiNavigation>}
   */
  async function preselectedFixture() {
    return fixture(
      html`<api-navigation summary selected="test1"></api-navigation>`
    );
  }

  /**
   * @returns {Promise<ApiNavigation>}
   */
  async function sortedFixture() {
    return fixture(
      html`<api-navigation rearrangeEndpoints></api-navigation>`
    );
  }

  /**
   * @returns {Promise<ApiNavigation>}
   */
  async function endpointsOpenedFixture(amf) {
    const elm = /** @type ApiNavigation */ (await fixture(html`<api-navigation
      endpointsOpened
      .amf="${amf}"
    ></api-navigation>`));
    await nextFrame();
    return elm;
  }

  /**
   * @returns {Promise<ApiNavigation>}
   */
  async function docsOpenedFixture(amf) {
    const elm = /** @type ApiNavigation */ (await fixture(html`<api-navigation
      docsOpened
      .amf="${amf}"
    ></api-navigation>`));
    await nextFrame();
    return elm;
  }

  /**
   * @returns {Promise<ApiNavigation>}
   */
  async function typesOpenedFixture(amf) {
    const elm = /** @type ApiNavigation */ (await fixture(html`<api-navigation
      typesOpened
      .amf="${amf}"
    ></api-navigation>`));
    await nextFrame();
    return elm;
  }

  /**
   * @returns {Promise<ApiNavigation>}
   */
  async function securityOpenedFixture(amf) {
    const elm = /** @type ApiNavigation */ (await fixture(html`<api-navigation
      securityOpened
      .amf="${amf}"
    ></api-navigation>`));
    await nextFrame();
    return elm;
  }

  /**
   * @returns {Promise<ApiNavigation>}
   */
  async function modelFixture(amf) {
    const elm = /** @type ApiNavigation */ (await fixture(
      html`<api-navigation .amf="${amf}"></api-navigation>`
    ));
    return elm;
  }

  /**
   * @returns {Promise<ApiNavigation>}
   */
  async function operationsOpenedFixture(amf, operationsOpened = true) {
    const elm = /** @type ApiNavigation */ (await fixture(
      html`<api-navigation .amf="${amf}" .operationsOpened="${operationsOpened}"></api-navigation>`
    ));
    return elm;
  }

  describe('Super basics - without model', () => {
    let element;

    before(async () => {
      element = await basicFixture();
      await nextFrame();
    });

    it('_isFragment is set', () => {
      assert.isFalse(element._isFragment);
    });

    it('_renderSummary is not false', () => {
      assert.isFalse(element._renderSummary);
    });

    it('summary is not rendered', () => {
      const panel = element.shadowRoot.querySelector('.summary');
      assert.notOk(panel);
    });

    it('documentation is not rendered', () => {
      const panel = element.shadowRoot.querySelector('.documentation');
      assert.notOk(panel);
    });

    it('types is not rendered', () => {
      const panel = element.shadowRoot.querySelector('.types');
      assert.notOk(panel);
    });

    it('security is not rendered', () => {
      const panel = element.shadowRoot.querySelector('.security');
      assert.notOk(panel);
    });

    it('endpoints is not rendered', () => {
      const panel = element.shadowRoot.querySelector('.endpoints');
      assert.notOk(panel);
    });
  });

  describe('Summary', () => {
    let element;
    beforeEach(async () => {
      element = await summaryFixture();
      await nextFrame();
    });

    it('Summary is rendered', () => {
      const panel = element.shadowRoot.querySelector('.summary');
      assert.ok(panel);
    });

    it('Clicking on summary changes selection', () => {
      const node = element.shadowRoot.querySelector('.list-item.summary');
      node.click();
      assert.equal(element.selected, 'summary');
      assert.equal(element.selectedType, 'summary');
    });
  });

  describe('Docs', () => {
    let element;
    let model;

    beforeEach(async () => {
      model = [
        {
          id: 'test1',
          label: 'test1',
          isExternal: false,
        },
        {
          id: 'test2',
          label: 'test2',
          isExternal: false,
        },
      ];
      element = await preselectedFixture();
      element._docs = model;
      await nextFrame();
    });

    it('hasDocs is computed', () => {
      assert.isTrue(element.hasDocs);
    });

    it('Docs is rendered', () => {
      const panel = element.shadowRoot.querySelector('.documentation');
      assert.ok(panel);
    });

    it('Preselected has a selection', () => {
      const selector = '.documentation [data-api-id="test1"]';
      const panel = element.shadowRoot.querySelector(selector);
      assert.ok(panel);
    });

    it('Clicking on an item changes selection', () => {
      const node = element.shadowRoot.querySelectorAll(
        '.documentation .list-item'
      )[1];
      node.click();
      assert.equal(element.selected, 'test2');
      assert.equal(element.selectedType, 'documentation');
    });
  });

  describe('Types', () => {
    let element;
    let model;
    beforeEach(async () => {
      model = [
        {
          id: 'test1',
          label: 'test1',
        },
        {
          id: 'test2',
          label: 'test2',
        },
      ];
      element = await preselectedFixture();
      element._types = model;
      await nextFrame();
    });

    it('hasTypes is computed', () => {
      assert.isTrue(element.hasTypes);
    });

    it('Types panel is rendered', () => {
      const panel = element.shadowRoot.querySelector('section.types');
      assert.ok(panel);
    });

    it('Preselected has a selection', () => {
      const selector = '.types [data-api-id="test1"]';
      const panel = element.shadowRoot.querySelector(selector);
      assert.ok(panel);
    });

    it('Clicking on an item changes selection', () => {
      const node = element.shadowRoot.querySelectorAll('.types .list-item')[1];
      node.click();
      assert.equal(element.selected, 'test2');
      assert.equal(element.selectedType, 'type');
    });
  });

  describe('Security', () => {
    let element;
    let model;
    beforeEach(async () => {
      model = [
        {
          id: 'test1',
          label: 'test1',
        },
        {
          id: 'test2',
          label: 'test2',
        },
      ];
      element = await preselectedFixture();
      element._security = model;
      await nextFrame();
    });

    it('hasSecurity is computed', () => {
      assert.isTrue(element.hasSecurity);
    });

    it('Types panel is rendered', () => {
      const panel = element.shadowRoot.querySelector('section.security');
      assert.ok(panel);
    });

    it('Preselected has a selection', () => {
      const selector = '.security [data-api-id="test1"]';
      const panel = element.shadowRoot.querySelector(selector);
      assert.ok(panel);
    });

    it('Clicking on an item changes selection', () => {
      const node = element.shadowRoot.querySelectorAll(
        '.security .list-item'
      )[1];
      node.click();
      assert.equal(element.selected, 'test2');
      assert.equal(element.selectedType, 'security');
    });
  });

  describe('Endpoints', () => {
    let element;
    let model;
    beforeEach(async () => {
      model = [
        {
          id: 'test1',
          label: 'test1',
          methods: [
            {
              id: 'method1',
              method: 'GET',
            },
          ],
        },
        {
          id: 'test2',
          label: 'test2',
          methods: [
            {
              id: 'method2',
              method: 'GET',
            },
            {
              id: 'method3',
              method: 'POST',
            },
          ],
        },
      ];
      element = await preselectedFixture();
      // @ts-ignore
      element._endpoints = model;
      await nextFrame();
    });

    it('hasEndpoints is computed', () => {
      assert.isTrue(element.hasEndpoints);
    });

    it('Types panel is rendered', () => {
      const panel = element.shadowRoot.querySelector('section.endpoints');
      assert.ok(panel);
    });

    it('Preselected has a selection', () => {
      const selector = '.endpoints [data-api-id="test1"]';
      const panel = element.shadowRoot.querySelector(selector);
      assert.ok(panel);
    });

    it('Clicking on endpoint toggles operation', async () => {
      const node = element.shadowRoot.querySelectorAll(
        '.endpoints .list-item.endpoint'
      )[1];
      node.click();
      await aTimeout(0);

      const collapsable = node.nextElementSibling;
      assert.isTrue(collapsable.opened);
    });

    it('Clicking on the overview changes selection', () => {
      const node = element.shadowRoot.querySelectorAll(
        '.list-item.operation[data-shape="endpoint"]'
      )[1];
      node.click();
      assert.equal(element.selected, 'test2');
      assert.equal(element.selectedType, 'endpoint');
    });

    it('rearrangeEndpoints is not true by default', () => {
      assert.isNotTrue(element.rearrangeEndpoints);
    });
  });

  describe('Sorting endpoints', () => {
    let element;
    let amf;

    const pathKey = 'http://a.ml/vocabularies/apiContract#path';

    const dataSet = [
      { [pathKey]: '/transactions/:txId' },
      { [pathKey]: '/billing' },
      { [pathKey]: '/accounts/:accountId' },
      { [pathKey]: '/accounts' },
      { [pathKey]: '/transactions' },
    ];

    const expected = [
      { [pathKey]: '/accounts' },
      { [pathKey]: '/accounts/:accountId' },
      { [pathKey]: '/billing' },
      { [pathKey]: '/transactions' },
      { [pathKey]: '/transactions/:txId' },
    ];

    beforeEach(async () => {
      element = await sortedFixture();
      amf = await AmfLoader.load(false, 'rearrange-api');
    });

    it('should sort endpoints', () => {
      const sorted = element._rearrangeEndpoints(dataSet);
      assert.sameDeepOrderedMembers(sorted, expected);
    });

    it('should have endpoints sorted', () => {
      element.amf = amf;

      element._endpoints.forEach((endpoint, i) =>
        assert.equal(endpoint.path, expected[i][pathKey])
      );
    });


    it('should sort after setting rearrangeEndpoints property', async () => {
      element = await modelFixture(amf);
      await nextFrame();
      let elementEndpointPaths = element._endpoints.map(endpoint => endpoint.path);
      const expectedPaths = expected.map(endpoint => endpoint[pathKey]);
      assert.notSameDeepOrderedMembers(elementEndpointPaths, expectedPaths);
      element.rearrangeEndpoints = true;
      await nextFrame();
      elementEndpointPaths = element._endpoints.map(endpoint => endpoint.path);
      assert.sameDeepOrderedMembers(elementEndpointPaths, expectedPaths);
    });

    it('should unsort after toggling rearrangeEndpoints property off', async () => {
      element = await modelFixture(amf);
      element.rearrangeEndpoints = true;
      await nextFrame();
      let elementEndpointPaths = element._endpoints.map(endpoint => endpoint.path);
      const expectedPaths = expected.map(endpoint => endpoint[pathKey]);
      assert.sameDeepOrderedMembers(elementEndpointPaths, expectedPaths);
      element.rearrangeEndpoints = false;
      await nextFrame();
      elementEndpointPaths = element._endpoints.map(endpoint => endpoint.path);
      assert.notSameDeepOrderedMembers(elementEndpointPaths, expectedPaths);
    });
  });

  describe('Navigation events', () => {
    let element;
    let model;
    beforeEach(async () => {
      model = {
        docs: [
          {
            id: 'test1',
            label: 'test1',
            isExternal: false,
          },
          {
            id: 'test2',
            label: 'test2',
            isExternal: false,
          },
        ],
        types: [
          {
            id: 'test3',
            label: 'test3',
          },
          {
            id: 'test4',
            label: 'test4',
          },
        ],
        security: [
          {
            id: 'test5',
            label: 'test5',
          },
          {
            id: 'test6',
            label: 'test6',
          },
        ],
        endpoints: [
          {
            id: 'test7',
            label: 'test7',
            methods: [
              {
                id: 'method8',
                method: 'GET',
              },
            ],
          },
          {
            id: 'test9',
            label: 'test9',
            methods: [
              {
                id: 'method10',
                method: 'GET',
              },
              {
                id: 'method11',
                method: 'POST',
              },
            ],
          },
        ],
      };
      element = await basicFixture();
      element._docs = model.docs;
      element._types = model.types;
      element._security = model.security;
      // @ts-ignore
      element._endpoints = model.endpoints;
      await nextFrame();
    });

    function fire(id, type, node) {
      const e = new CustomEvent('api-navigation-selection-changed', {
        bubbles: true,
        composed: true,
        detail: {
          selected: id,
          type,
        },
      });
      (node || document.body).dispatchEvent(e);
    }

    it('Updates selection from the change event', async () => {
      const id = 'test3';
      fire(id, 'type');
      assert.equal(element.selected, id);
      assert.equal(element.selectedType, 'type');
      const node = element.shadowRoot.querySelector(`[data-api-id="${id}"]`);
      await nextFrame();
      assert.isTrue(node.classList.contains('selected'));
    });

    it('Does not update selection if it is the source', () => {
      const id = 'test3';
      fire(id, 'type', element);
      assert.isUndefined(element.selected);
    });

    it('Does not dispatch selection event', () => {
      const id = 'test3';
      const spy = sinon.spy();
      element.addEventListener('api-navigation-selection-changed', spy);
      fire(id, 'type');
      assert.isFalse(spy.called);
    });

    [
      ['type', 'test3', '.list-item'],
      ['security', 'test5', '.list-item'],
      ['documentation', 'test1', '.list-item'],
      ['endpoint', 'test7', '.operation'],
    ].forEach(item => {
      const [type, id, selector] = item;
      it(`Dispatches event when clicking on ${type}`, () => {
        const s = `${selector}[data-api-id="${id}"]`;
        const node = element.shadowRoot.querySelector(s);
        let called = false;
        element.addEventListener('api-navigation-selection-changed', e => {
          called = true;
          assert.equal(e.detail.selected, id);
          assert.equal(e.detail.type, type);
          assert.isUndefined(e.detail.endpointId);
        });
        MockInteractions.tap(node);
        assert.isTrue(called);
      });
    });

    it('Dispatches event when clicking on method', () => {
      const selector = '.operation[data-api-id="method10"]';
      const node = element.shadowRoot.querySelector(selector);
      let called = false;
      element.addEventListener('api-navigation-selection-changed', e => {
        called = true;
        assert.equal(e.detail.selected, 'method10');
        assert.equal(e.detail.type, 'method');
        assert.equal(e.detail.endpointId, 'test9');
      });
      MockInteractions.tap(node);
      assert.isTrue(called);
    });
  });

  describe('computePathName()', () => {
    it('Computes short path', () => {
      const base = ['/root', '/root/other'];
      const current = '/root/other/path';
      const parts = ['root', 'other', 'path'];
      const indent = 3;
      const result = computePathName(current, parts, indent, base);
      assert.equal(result, '/path');
    });

    it('Computes short path for combined endpoint names', () => {
      const base = ['/root', '/root/other'];
      const current = '/root/other/path';
      const parts = ['root', 'other'];
      const indent = 1;
      const result = computePathName(current, parts, indent, base);
      assert.equal(result, '/other/path');
    });
  });

  describe('_computeEndpointPaddingLeft()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      await nextFrame();
    });

    it('Computes default padding', () => {
      const result = element._computeEndpointPaddingLeft();
      assert.equal(result, 16);
    });

    it('Computes value for single value padding', () => {
      element.style.setProperty('--api-navigation-list-item-padding', '5px');
      const result = element._computeEndpointPaddingLeft();
      assert.equal(result, 5);
    });

    it('Computes value for double padding value', () => {
      element.style.setProperty(
        '--api-navigation-list-item-padding',
        '5px 10px'
      );
      const result = element._computeEndpointPaddingLeft();
      assert.equal(result, 10);
    });

    it('Computes value for triple padding value', () => {
      element.style.setProperty(
        '--api-navigation-list-item-padding',
        '5px 10px 15px'
      );
      const result = element._computeEndpointPaddingLeft();
      assert.equal(result, 10);
    });

    it('Computes value for full padding value', () => {
      element.style.setProperty(
        '--api-navigation-list-item-padding',
        '5px 10px 15px 20px'
      );
      const result = element._computeEndpointPaddingLeft();
      assert.equal(result, 20);
    });
  });

  describe('_computeOperationPaddingLeft()', () => {
    let element;

    beforeEach(async () => {
      element = await basicFixture();
      await nextFrame();
    });

    it('Computes default padding', () => {
      const result = element._computeOperationPaddingLeft();
      assert.equal(result, 24);
    });

    it('Computes padding from css property', () => {
      element.style.setProperty(
        '--api-navigation-operation-item-padding-left',
        '5px'
      );
      const result = element._computeOperationPaddingLeft();
      assert.equal(result, 5);
    });
  });

  describe('_toggleEndpoint()', () => {
    let element;

    beforeEach(async () => {
      element = await basicFixture();
      await nextFrame();
    });

    it('Does nothing when node with data-endpoint-id is not in the path', () => {
      const spy = sinon.spy(element, 'toggleOperations');
      element._toggleEndpoint({
        composedPath: () => [],
      });
      assert.isFalse(spy.called);
    });

    it('Ignores node that are not of a type of 1 (Element)', () => {
      const spy = sinon.spy(element, 'toggleOperations');
      element._toggleEndpoint({
        composedPath: () => [document.createTextNode('test')],
      });
      assert.isFalse(spy.called);
    });

    it('Ignores nodes without data-endpoint-id', () => {
      const spy = sinon.spy(element, 'toggleOperations');
      element._toggleEndpoint({
        composedPath: () => [document.createElement('span')],
      });
      assert.isFalse(spy.called);
    });

    it('Calls toggleOperations()', () => {
      const spy = sinon.spy(element, 'toggleOperations');
      const node = document.createElement('span');
      node.dataset.endpointId = 'testId';
      element._toggleEndpoint({
        composedPath: () => [node],
      });
      assert.isTrue(spy.called, 'Function called');
      assert.equal(spy.args[0][0], 'testId', 'Has argument set');
    });
  });

  describe('_methodFilter()', () => {
    let element;
    beforeEach(async () => {
      element = await summaryFixture();
    });

    it('Returns true when __effectiveQuery is not set', () => {
      const result = element._methodFilter();
      assert.isTrue(result);
    });

    it('Returns true when item label contains query', () => {
      element.__effectiveQuery = 'abc';
      const result = element._methodFilter({
        label: 'abcd',
      });
      assert.isTrue(result);
    });

    it('Returns true when method contains query', () => {
      element.__effectiveQuery = 'abc';
      const result = element._methodFilter({
        method: 'abc',
      });
      assert.isTrue(result);
    });
  });

  describe('_queryChanged()', () => {
    let element;
    beforeEach(async () => {
      element = await summaryFixture();
    });

    it('Does nothing when __queryDebouncer is already set', () => {
      element.__queryDebouncer = 1;
      element.query = 'test';
      assert.equal(element.__queryDebouncer, 1);
    });

    it('Sets __queryDebouncer', async () => {
      element.query = 'test';
      assert.isTrue(element.__queryDebouncer);
      await nextFrame();
    });

    it('Calls _flushQuery()', done => {
      element.query = 'test';
      const spy = sinon.spy(element, '_flushQuery');
      setTimeout(() => {
        assert.isTrue(spy.called);
        done();
      });
    });

    it('Re-sets __queryDebouncer', done => {
      element.query = 'test';
      setTimeout(() => {
        assert.isFalse(element.__queryDebouncer);
        done();
      });
    });
  });

  [
    ['Compact model', true],
    ['Regular model', false],
  ].forEach(item => {
    describe('_toggleSectionHandler()', () => {
      let amf;
      let element;

      beforeEach(async () => {
        amf = await AmfLoader.load(item[1]);
        element = await basicFixture();
        element.amf = amf;
        await nextFrame();
      });

      it('Does nothing when node not found in path', () => {
        element._toggleSectionHandler({
          composedPath: () => [],
        });
        // No error
      });

      it('Skips element without dataset property', () => {
        element._toggleSectionHandler({
          composedPath: () => [document.createTextNode('test')],
        });
      });

      it('Skips element without data-section attribute', () => {
        const node = document.createElement('span');
        element._toggleSectionHandler({
          composedPath: () => [node],
        });
      });

      it('Toggles section', () => {
        const node = document.createElement('span');
        node.dataset.section = 'endpoints';
        element._toggleSectionHandler({
          composedPath: () => [node],
        });
        assert.isTrue(element.endpointsOpened);
      });
    });

    describe('_selectMethodPassive()', () => {
      let amf;
      let element;

      beforeEach(async () => {
        amf = await AmfLoader.load(item[1]);
        element = await basicFixture();
        element.amf = amf;
        await nextFrame();
      });

      it('Does nothing when ID is not in the DOM', () => {
        element._selectMethodPassive('some-id');
        assert.isUndefined(element.__hasPassiveSelection);
      });

      it('Adds "passive-selected" class name to the method label', () => {
        const { id } = element._endpoints[0].methods[0];
        element._selectMethodPassive(id);
        const node = element.shadowRoot.querySelector('.passive-selected');
        assert.equal(node.dataset.apiId, id);
      });

      it('Sets __hasPassiveSelection flag', () => {
        const { id } = element._endpoints[0].methods[0];
        element._selectMethodPassive(id);
        assert.isTrue(element.__hasPassiveSelection);
      });

      it('Renders toggle opened', () => {
        const { id } = element._endpoints[0].methods[0];
        element._selectMethodPassive(id);
        const node = element.shadowRoot.querySelector('.passive-selected');
        assert.isTrue(node.parentElement.opened);
      });
    });

    describe('_itemClickHandler()', () => {
      let amf;
      let element;

      beforeEach(async () => {
        amf = await AmfLoader.load(item[1]);
        element = await summaryFixture();
        element.amf = amf;
        await nextFrame();
      });

      it('Uses currentTarget as the target', () => {
        const node = element.shadowRoot.querySelector('.list-item.summary');
        const spy = sinon.spy(element, '_selectItem');
        element._itemClickHandler({
          currentTarget: node,
        });
        assert.isTrue(spy.called);
        assert.isTrue(spy.args[0][0] === node);
      });

      it('Uses target as the target', () => {
        const node = element.shadowRoot.querySelector('.list-item.summary');
        const spy = sinon.spy(element, '_selectItem');
        element._itemClickHandler({
          target: node,
        });
        assert.isTrue(spy.called);
        assert.isTrue(spy.args[0][0] === node);
      });

      it('Makes adjustments for method label', () => {
        const node = element.shadowRoot.querySelector('.method-label');
        const parent = node.parentNode;
        const spy = sinon.spy(element, '_selectItem');
        element._itemClickHandler({
          target: node,
        });
        assert.isTrue(spy.called);
        assert.isTrue(spy.args[0][0] === parent);
      });
    });

    describe('_flushQuery()', () => {
      let amf;
      let element;

      beforeEach(async () => {
        amf = await AmfLoader.load(item[1]);
        element = await summaryFixture();
        element.amf = amf;
        await nextFrame();
      });

      it('Sets __effectiveQuery as a lowercase query', () => {
        element.__queryDebouncer = true;
        element.query = 'Files';
        element._flushQuery();
        assert.equal(element.__effectiveQuery, 'files');
      });

      it('Clear the query', () => {
        element.__queryDebouncer = true;
        element.query = '';
        element._flushQuery();
        assert.equal(element.__effectiveQuery, '');
      });
    });

    describe('computeRenderPath()', () => {
      let amf;
      let element;

      beforeEach(async () => {
        amf = await AmfLoader.load(item[1]);
        element = await summaryFixture();
        element.amf = amf;
        await nextFrame();
      });

      it('Returns true when both arguments are true', () => {
        const result = computeRenderPath(true, true);
        assert.isTrue(result);
      });

      it('Returns false when allowPaths is false', () => {
        const result = computeRenderPath(false, true);
        assert.isFalse(result);
      });

      it('Returns false when allowPaths is not set', () => {
        const result = computeRenderPath(undefined, true);
        assert.isFalse(result);
      });

      it('Returns false when renderPath is false', () => {
        const result = computeRenderPath(true, false);
        assert.isFalse(result);
      });

      it('Returns false when renderPath is not set', () => {
        const result = computeRenderPath(true, undefined);
        assert.isFalse(result);
      });

      it('Returns false when both undefined', () => {
        const result = computeRenderPath(false, false);
        assert.isFalse(result);
      });

      it('Paths are hidden by default', () => {
        const endpoint = AmfHelper.getEndpoint(element, amf, '/about');
        const id = endpoint['@id'];
        const node = element.shadowRoot.querySelector(
          `.endpoint[data-endpoint-id="${id}"] .path-name`
        );
        assert.notOk(node);
      });

      it('Renders paths when "allowPaths" is set', async () => {
        element.allowPaths = true;
        await nextFrame();
        const endpoint = AmfHelper.getEndpoint(element, amf, '/about');
        const id = endpoint['@id'];
        const node = element.shadowRoot.querySelector(
          `.endpoint[data-endpoint-id="${id}"] .path-name`
        );
        assert.ok(node);
      });
    });

    describe('AsyncAPI', () => {
      let amf;
      let element;

      beforeEach(async () => {
        amf = await AmfLoader.load(item[1], asyncApi);
        element = await basicFixture();
        element.amf = amf;
        await nextFrame();
      });

      it('should render channels', () => {
        assert.lengthOf(element._endpoints, 2);
      });

      it('should render "Channels" label', () => {
        assert.equal(
          element.shadowRoot.querySelector('.endpoints div.title-h3')
            .textContent,
          'Channels'
        );
      });
    });

    describe('Unordered endpoints', () => {
      let amf;
      let element;

      beforeEach(async () => {
        amf = await AmfLoader.load(item[1], unorderedEndpoints);
        element = await basicFixture();
        element.amf = amf;
        await nextFrame();
      });

      it('should render full path of third endpoint', () => {
        assert.equal(
          element.shadowRoot.querySelectorAll(
            '.list-item.endpoint .endpoint-name'
          )[2].innerText,
          '/foo/bar'
        );
      });
    });

    describe('APIC-550', () => {
      let element;
      let amf;

      it('should render without errors', async () => {
        amf = await AmfLoader.load(item[1], 'APIC-550');
        element = await modelFixture(amf);
        await nextFrame();
        assert.lengthOf(element._endpoints, 1);
      });
    });

    describe('APIC-554', () => {
      let amf;
      let element;

      before(async () => {
        amf = await AmfLoader.load(item[1], 'APIC-554');
      });

      beforeEach(async () => {
        element = await modelFixture(amf);
      });

      it('should compute endpoint names correctly', () => {
        const labels = [
          '/customer/{customerId}/chromeos',
          '/deviceId',
          '/customerId',
        ];
        assert.deepEqual(
          element._endpoints.map(e => e.label),
          labels
        );
      });
    });

    describe('APIC-554-ii', () => {
      let amf;
      let element;

      before(async () => {
        amf = await AmfLoader.load(item[1], 'APIC-554-ii');
      });

      beforeEach(async () => {
        element = await modelFixture(amf);
      });

      it('should compute endpoint names correctly', () => {
        const labels = [
          '/customers/{customer}/chromeos/deviceId',
          '/customer/{customer}/chromeos/deviceId',
        ];
        assert.deepEqual(
          element._endpoints.map(e => e.label),
          labels
        );
      });
    });

    describe('SE-19215', () => {
      let amf;
      let element;

      before(async () => {
        amf = await AmfLoader.load(item[1], 'SE-19215');
      });

      beforeEach(async () => {
        element = await modelFixture(amf);
      });

      it('should compute endpoint names correctly', () => {
        const labels = ['/omaha/transactionscall1', '/transactions/call2'];
        assert.deepEqual(
          element._endpoints.map(e => e.label),
          labels
        );
      });
    });

    describe('operationsOpened', () => {
      let amf;
      let element;

      before(async () => {
        amf = await AmfLoader.load(item[1]);
      });

      beforeEach(async () => {
        element = await operationsOpenedFixture(amf, true);
        await aTimeout(0);
      });

      it('should expand all operations when operationsOpened', () => {
        const operations = element.shadowRoot.querySelectorAll('.list-item.endpoint');
        assert.equal(operations.length, 32);

        let openedOperations = 0;
        operations.forEach(e => {
          if (e.getAttribute('endpoint-opened') === '') {
            openedOperations++;
          }
        });
        assert.equal(openedOperations, 32);
      });
    });

    describe('noOverview', () => {
      let amf;
      let element;

      before(async () => {
        amf = await AmfLoader.load(item[1], 'simple-api');
      });

      beforeEach(async () => {
        element = await modelFixture(amf);
      });

      it('should set noOverview to false by default', () => {
        assert.isFalse(element.noOverview)
      });

      it('should render endpoints overview by default', () => {
        const endpoints = element.shadowRoot.querySelectorAll(
          '.list-item.operation[data-shape="endpoint"]'
        );
        assert.equal(endpoints.length, 3);
      });

      it('should render endpoints name by default', () => {
        const endpoints = element.shadowRoot.querySelectorAll(
          '.endpoint-name'
        );
        assert.equal(endpoints.length, 3);
      });

      it('should set noOverview to true', async () => {
        element.noOverview = true;
        await aTimeout(0);

        assert.isTrue(element.noOverview)
      });

      it('should not render endpoints overview when noOverview', async () => {
        element.noOverview = true;
        await aTimeout(0);

        const endpoints = element.shadowRoot.querySelectorAll(
          '.list-item.operation[data-shape="endpoint"]'
        );
        assert.equal(endpoints.length, 0);
      });

      it('should render clickable endpoints name when noOverview', async () => {
        element.noOverview = true;
        await aTimeout(0);

        const endpoints = element.shadowRoot.querySelectorAll(
          '.endpoint-name-overview'
        );
        assert.equal(endpoints.length, 3);
      });

      it('should select endpoint when clicking its name', async () => {
        element.noOverview = true;
        await aTimeout(0);

        const endpointName = element.shadowRoot.querySelector(
          '.endpoint-name-overview'
        );
        endpointName.click();
        await aTimeout(0);

        const endpoint = element.shadowRoot.querySelector(`.endpoint[data-endpoint-id="${endpointName.dataset.apiId}"]`);
        assert.equal(endpoint.className, "list-item endpoint selected");
      });

      describe('menu keyboard navigation', () => {
        it('should focus on endpoint path detail first', async () => {
          element.noOverview = true;
          element.endpointsOpened = true;
          await aTimeout(5);
          MockInteractions.focus(element);
          await nextFrame();
          // Key press down
          MockInteractions.keyDownOn(element, 40, [], 'ArrowDown');
          await nextFrame();
          const node = element.shadowRoot.querySelector('div[data-endpoint-path="/one"] .path-details');
          assert.equal(
            element.focusedItem,
            node,
            'element.focusedItem is last item'
          );
        });

        it('should focus on endpoint toggle arrow second', async () => {
          element.noOverview = true;
          element.endpointsOpened = true;
          await aTimeout(5);
          MockInteractions.focus(element);
          await nextFrame();
          // Key press down
          MockInteractions.keyDownOn(element, 40, [], 'ArrowDown');
          MockInteractions.keyDownOn(element, 40, [], 'ArrowDown');
          await nextFrame();
          const node = element.shadowRoot.querySelector('div[data-endpoint-path="/one"] anypoint-icon-button');
          assert.equal(
            element.focusedItem,
            node,
            'element.focusedItem is last item'
          );
        });
      });
    });

    describe('renderFullPaths', () => {
      let amf;
      let element;

      beforeEach(async () => {
        amf = await AmfLoader.load(item[1]);
        element = await basicFixture();
        element.amf = amf;
        await nextFrame();
      });

      it('renders full paths when renderFullPaths is set', async () => {
        element.renderFullPaths = true;
        element.endpointsOpened = true;
        await aTimeout(50);
        const renderedPath = element.shadowRoot.querySelectorAll('.list-item.endpoint')[2].textContent.split('\n').join('').trim();
        assert.equal(renderedPath, '/files/{fileId}/copy');
      });

      it('does not indent any endpoint', async () => {
        element.renderFullPaths = true;
        element.endpointsOpened = true;
        await aTimeout(50);
        element._endpoints.forEach(endpoint => assert.equal(endpoint.indent, 0));
      });
    });
  });

  describe('a11y', () => {
    let element = /** @type ApiNavigation */ (null);
    beforeEach(async () => {
      const amf = await AmfLoader.load();
      element = await summaryFixture();
      element.amf = amf;
      element.selected = 'summary';
      await nextFrame();
    });

    it('Performs a11y tests', () => {
      assert.isAccessible(element);
    });
  });

  describe('default opened state', () => {
    let amf;
    before(async () => {
      amf = await AmfLoader.load();
    });

    it('opens endpoints when initialized', async () => {
      const element = await endpointsOpenedFixture(amf);
      const node = /** @type AnypointCollapseElement */ (element.shadowRoot.querySelector(
        '.endpoints > anypoint-collapse'
      ));
      assert.isTrue(node.opened);
    });

    it('opens documentation when initialized', async () => {
      const element = await docsOpenedFixture(amf);
      const node = /** @type AnypointCollapseElement */ (element.shadowRoot.querySelector(
        '.documentation > anypoint-collapse'
      ));
      assert.isTrue(node.opened);
    });

    it('opens types when initialized', async () => {
      const element = await typesOpenedFixture(amf);
      const node = /** @type AnypointCollapseElement */ (element.shadowRoot.querySelector('.types > anypoint-collapse'));
      assert.isTrue(node.opened);
    });

    it('opens security when initialized', async () => {
      const element = await securityOpenedFixture(amf);
      const node = /** @type AnypointCollapseElement */ (element.shadowRoot.querySelector(
        '.security > anypoint-collapse'
      ));
      assert.isTrue(node.opened);
    });
  });

  [['a11y', true]].forEach(([label, compact]) => {
    describe(String(label), () => {
      let amf;

      before(async () => {
        amf = await AmfLoader.load(compact, 'simple-api');
      });

      describe('menu keyboard tests', () => {
        let element;
        beforeEach(async () => {
          element = await modelFixture(amf);
        });

        it('first item gets focus when menu is focused', async () => {
          MockInteractions.focus(element);
          await aTimeout(0);
          const node = element.shadowRoot.querySelector(
            '.endpoints .section-title'
          );
          assert.equal(
            element.focusedItem,
            node,
            'element.focusedItem is first item'
          );
        });

        it('selected item gets focus when menubar is focused', async () => {
          element.endpointsOpened = true;
          await aTimeout(0);
          const node = element.shadowRoot.querySelector('.list-item.operation');
          MockInteractions.tap(node);
          window.focus();
          await aTimeout(0);
          MockInteractions.focus(element);
          assert.equal(
            element.focusedItem,
            node,
            'element.focusedItem is first item'
          );
        });

        it('focused on previous item', async () => {
          element.endpointsOpened = true;
          await aTimeout(0);
          MockInteractions.focus(element);
          await aTimeout(0);
          // Key press up
          MockInteractions.keyDownOn(element, 38, [], 'ArrowUp');
          await aTimeout(0);
          const node = element.shadowRoot.querySelectorAll(
            '.endpoints > anypoint-collapse .list-item.endpoint'
          )[2];
          assert.equal(
            element.focusedItem,
            node,
            'element.focusedItem is last item'
          );
        });

        it('focused on next item', async () => {
          MockInteractions.focus(element);
          await aTimeout(0);
          // Key press down
          MockInteractions.keyDownOn(element, 40, [], 'ArrowDown');
          await aTimeout(0);
          const node = element.shadowRoot.querySelector(
            '.endpoints > .section-title'
          );
          assert.equal(
            element.focusedItem,
            node,
            'element.focusedItem is last item'
          );
        });

        it('focused on next item', async () => {
          MockInteractions.focus(element);
          await aTimeout(0);
          // Key press down
          MockInteractions.keyDownOn(element, 40, [], 'ArrowDown');
          await aTimeout(0);
          const node = element.shadowRoot.querySelector(
            '.endpoints > .section-title'
          );
          assert.equal(
            element.focusedItem,
            node,
            'element.focusedItem is last item'
          );
        });

        it('keyboard events should not bubble', async () => {
          let keyCounter = 0;
          element.parentElement.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
              keyCounter++;
            }
            if (event.key === 'ArrowUp') {
              keyCounter++;
            }
            if (event.key === 'ArrowDown') {
              keyCounter++;
            }
          });
          // up
          MockInteractions.keyDownOn(element, 38, [], 'ArrowUp');
          // down
          MockInteractions.keyDownOn(element, 40, [], 'ArrowDown');
          // esc
          MockInteractions.keyDownOn(element, 27, [], 'Escape');
          await aTimeout(0);
          assert.equal(keyCounter, 0);
        });

        it('selects operation item with space bar', () => {
          const node = element.shadowRoot.querySelector('.list-item.operation');
          MockInteractions.keyDownOn(node, 32, [], ' ');
          assert.equal(element.selected, node.dataset.apiId);
        });

        it('selects operation item with enter', () => {
          const node = element.shadowRoot.querySelector('.list-item.operation');
          MockInteractions.keyDownOn(node, 13, [], 'Enter');
          assert.equal(element.selected, node.dataset.apiId);
        });

        it('toggles endpoints with space bar', () => {
          const node = element.shadowRoot.querySelector('.section-title');
          MockInteractions.keyDownOn(node, 32, [], ' ');
          assert.isTrue(element.endpointsOpened);
        });

        it('toggles endpoint with space bar', async() => {
          const node = element.shadowRoot.querySelector('.list-item.endpoint');
          MockInteractions.keyDownOn(node, 32, [], ' ');
          await aTimeout(0);

          assert.isTrue(node.nextElementSibling.opened);
        });

        it('shift+tab removes focus', async () => {
          MockInteractions.focus(element);
          // Wait for async focus
          await aTimeout(0);
          // Key press 'Tab'
          MockInteractions.keyDownOn(element, 9, ['shift'], 'Tab');
          assert.equal(element.getAttribute('tabindex'), '-1');
          assert.isTrue(element._shiftTabPressed);
          assert.equal(element._focusedItem, null);
          await aTimeout(1);
          assert.isFalse(element._shiftTabPressed);
          assert.equal(element.getAttribute('tabindex'), '0');
        });
      });
    });
  });
});
