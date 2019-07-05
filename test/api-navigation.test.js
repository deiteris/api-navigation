import { fixture, assert, nextFrame } from '@open-wc/testing';
import { AmfLoader } from './amf-loader.js';
import { AmfHelper } from './amf-helper.js';
import { tap, keyEventOn, keyboardEventFor } from '@polymer/iron-test-helpers/mock-interactions.js';
import sinon from 'sinon/pkg/sinon-esm.js';
import '../api-navigation.js';

describe('<api-navigation>', () => {
  async function basicFixture() {
    return (await fixture(`<api-navigation></api-navigation>`));
  }

  async function summaryFixture() {
    return (await fixture(`<api-navigation summary></api-navigation>`));
  }

  async function preselectedFixture() {
    return (await fixture(`<api-navigation summary selected="test1"></api-navigation>`));
  }

  async function arrangedFixture() {
    return (await fixture(`<api-navigation rearrangeendpoints="true"></api-navigation>`));
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
      model = [{
        id: 'test1',
        label: 'test1'
      }, {
        id: 'test2',
        label: 'test2'
      }];
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
      const node = element.shadowRoot.querySelectorAll('.documentation .list-item')[1];
      node.click();
      assert.equal(element.selected, 'test2');
      assert.equal(element.selectedType, 'documentation');
    });
  });

  describe('Types', () => {
    let element;
    let model;
    beforeEach(async () => {
      model = [{
        id: 'test1',
        label: 'test1'
      }, {
        id: 'test2',
        label: 'test2'
      }];
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
      model = [{
        id: 'test1',
        label: 'test1'
      }, {
        id: 'test2',
        label: 'test2'
      }];
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
      const node = element.shadowRoot.querySelectorAll('.security .list-item')[1];
      node.click();
      assert.equal(element.selected, 'test2');
      assert.equal(element.selectedType, 'security');
    });
  });

  describe('Endpoints', () => {
    let element;
    let model;
    beforeEach(async () => {
      model = [{
        id: 'test1',
        label: 'test1',
        methods: [{
          id: 'method1',
          method: 'GET'
        }]
      }, {
        id: 'test2',
        label: 'test2',
        methods: [{
          id: 'method2',
          method: 'GET'
        }, {
          id: 'method3',
          method: 'POST'
        }]
      }];
      element = await preselectedFixture();
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

    it('Clicking on endpoint toggles operation', () => {
      const node = element.shadowRoot.querySelectorAll('.endpoints .list-item.endpoint')[1];
      node.click();
      const collapsable = node.nextElementSibling;
      assert.isTrue(collapsable.opened);
    });

    it('Clicking on the overview changes selection', () => {
      const node = element.shadowRoot.querySelectorAll(
        '.list-item.operation[data-shape="endpoint"]')[1];
      node.click();
      assert.equal(element.selected, 'test2');
      assert.equal(element.selectedType, 'endpoint');
    });

    it('rearrangeEndpoints is not true by default', () => {
      assert.isNotTrue(element.rearrangeEndpoints);
    });
  });

  describe('`Rearranging endpoints`', () => {
    let element;
    let amf;

    const dataSet = [
      { path: '/transactions/:txId' },
      { path: '/billing' },
      { path: '/accounts/:accountId' },
      { path: '/accounts' },
      { path: '/transactions' },
    ];

    const expected = [
      { path: "/transactions" },
      { path: "/transactions/:txId" },
      { path: "/billing" },
      { path: "/accounts" },
      { path: "/accounts/:accountId" }
    ];

    beforeEach(async () => {
      element = await arrangedFixture();
      amf = await AmfLoader.load(false, 'rearrange-api');
    });

    it('should rearrange endpoints', () => {
      const rearranged = element._rearrangeEndpoints(dataSet);
      assert.sameDeepOrderedMembers(rearranged, expected)
    });

    it('should have endpoints rearranged', () => {
      element.amf = amf;

      element._endpoints.forEach((endpoint, i) => assert.equal(endpoint.path, expected[i].path));
    });
  });

  describe('Navigation events`', () => {
    let element;
    let model;
    beforeEach(async () => {
      model = {
        docs: [{
          id: 'test1',
          label: 'test1'
        }, {
          id: 'test2',
          label: 'test2'
        }],
        types: [{
          id: 'test3',
          label: 'test3'
        }, {
          id: 'test4',
          label: 'test4'
        }],
        security: [{
          id: 'test5',
          label: 'test5'
        }, {
          id: 'test6',
          label: 'test6'
        }],
        endpoints: [{
          id: 'test7',
          label: 'test7',
          methods: [{
            id: 'method8',
            method: 'GET'
          }]
        }, {
          id: 'test9',
          label: 'test9',
          methods: [{
            id: 'method10',
            method: 'GET'
          }, {
            id: 'method11',
            method: 'POST'
          }]
        }]
      };
      element = await basicFixture();
      element._docs = model.docs;
      element._types = model.types;
      element._security = model.security;
      element._endpoints = model.endpoints;
      await nextFrame();
    });

    function fire(id, type, node) {
      const e = new CustomEvent('api-navigation-selection-changed', {
        bubbles: true,
        composed: true,
        detail: {
          selected: id,
          type: type
        }
      });
      (node || document.body).dispatchEvent(e);
    }

    it('Updates selection from the change event', () => {
      const id = 'test3';
      fire(id, 'type');
      assert.equal(element.selected, id);
      assert.equal(element.selectedType, 'type');
      const node = element.shadowRoot.querySelector(`[data-api-id="${id}"]`);
      assert.isTrue(node.classList.contains('iron-selected'));
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
      ['endpoint', 'test7', '.operation']
    ].forEach((item) => {
      const [type, id, selector] = item;
      it(`Dispatches event when clicking on ${type}`, function() {
        const s = `${selector}[data-api-id="${id}"]`;
        const node = element.shadowRoot.querySelector(s);
        let called = false;
        element.addEventListener('api-navigation-selection-changed', (e) => {
          called = true;
          assert.equal(e.detail.selected, id);
          assert.equal(e.detail.type, type);
          assert.isUndefined(e.detail.endpointId);
        });
        tap(node);
        assert.isTrue(called);
      });
    });

    it('Dispatches event when clicking on method', function() {
      const selector = '.operation[data-api-id="method10"]';
      const node = element.shadowRoot.querySelector(selector);
      let called = false;
      element.addEventListener('api-navigation-selection-changed', (e) => {
        called = true;
        assert.equal(e.detail.selected, 'method10');
        assert.equal(e.detail.type, 'method');
        assert.equal(e.detail.endpointId, 'test9');
      });
      tap(node);
      assert.isTrue(called);
    });
  });

  describe('_computePathName()', () => {
    let element;
    before(async () => {
      element = await basicFixture();
    });

    it('Computes short path', () => {
      const base = ['/root', '/root/other'];
      const current = '/root/other/path';
      const parts = ['root', 'other'];
      const indent = 2;
      const result = element._computePathName(current, parts, indent, base);
      assert.equal(result, '/path');
    });

    it('Computes short path for combined endpoint names', () => {
      const base = ['/root', '/root/other'];
      const current = '/root/other/path';
      const parts = ['root', 'other'];
      const indent = 1;
      const result = element._computePathName(current, parts, indent, base);
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
      element.style.setProperty('--api-navigation-list-item-padding', '5px 10px');
      const result = element._computeEndpointPaddingLeft();
      assert.equal(result, 10);
    });

    it('Computes value for tripple padding value', () => {
      element.style.setProperty('--api-navigation-list-item-padding', '5px 10px 15px');
      const result = element._computeEndpointPaddingLeft();
      assert.equal(result, 10);
    });

    it('Computes value for full padding value', () => {
      element.style.setProperty('--api-navigation-list-item-padding', '5px 10px 15px 20px');
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
      element.style.setProperty('--api-navigation-operation-item-padding-left', '5px');
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
        composedPath: () => []
      });
      assert.isFalse(spy.called);
    });

    it('Ignores node that are not of a type of 1 (Element)', () => {
      const spy = sinon.spy(element, 'toggleOperations');
      element._toggleEndpoint({
        composedPath: () => [document.createTextNode('test')]
      });
      assert.isFalse(spy.called);
    });

    it('Ignores nodes without data-endpoint-id', () => {
      const spy = sinon.spy(element, 'toggleOperations');
      element._toggleEndpoint({
        composedPath: () => [document.createElement('span')]
      });
      assert.isFalse(spy.called);
    });

    it('Calls toggleOperations()', () => {
      const spy = sinon.spy(element, 'toggleOperations');
      const node = document.createElement('span');
      node.dataset.endpointId = 'testId';
      element._toggleEndpoint({
        composedPath: () => [node]
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
        label: 'abcd'
      });
      assert.isTrue(result);
    });

    it('Returns true when method contains query', () => {
      element.__effectiveQuery = 'abc';
      const result = element._methodFilter({
        method: 'abc'
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

    it('Calls _flushQuery()', (done) => {
      element.query = 'test';
      const spy = sinon.spy(element, '_flushQuery');
      setTimeout(() => {
        assert.isTrue(spy.called);
        done();
      });
    });

    it('Re-sets __queryDebouncer', (done) => {
      element.query = 'test';
      setTimeout(() => {
        assert.isFalse(element.__queryDebouncer);
        done();
      });
    });
  });

  [
    ['Compact model', true],
    ['Regular model', false]
  ].forEach((item) => {
    describe('_spaceUpHandler() - ' + item[0], () => {
      let amf;
      let element;

      beforeEach(async () => {
        amf = await AmfLoader.load(item[1]);
        element = await basicFixture();
        element.amf = amf;
        await nextFrame();
      });

      it('Calls _spaceUpHandler() when space bar triggers on operation label', () => {
        const node = element.shadowRoot.querySelector('.list-item.operation');
        node.parentElement.opened = true;
        const spy = sinon.spy(node, 'click');
        keyEventOn(node, 'keyup', 32, '', 'Space');
        assert.isTrue(spy.called);
      });

      it('Calls _itemClickHandler()', () => {
        const node = element.shadowRoot.querySelector('.list-item.operation');
        node.parentElement.opened = true;
        // _selectItem is called by _itemClickHandler()
        const spy = sinon.spy(element, '_selectItem');
        keyEventOn(node, 'keyup', 32, '', 'Space');
        assert.isTrue(spy.called);
      });
    });

    describe('_spaceDownHandler() - ' + item[0], () => {
      let amf;
      let element;

      beforeEach(async () => {
        amf = await AmfLoader.load(item[1]);
        element = await basicFixture();
        element.amf = amf;
        await nextFrame();
      });

      it('Calls _spaceDownHandler() when space bar triggers on operation label', () => {
        const node = element.shadowRoot.querySelector('.list-item.operation');
        node.parentElement.opened = true;
        const e = keyboardEventFor('keydown', 32, '', 'Space');
        node.dispatchEvent(e);
        assert.isTrue(e.defaultPrevented);
      });
    });

    describe('_toggleSection()', () => {
      let amf;
      let element;

      beforeEach(async () => {
        amf = await AmfLoader.load(item[1]);
        element = await basicFixture();
        element.amf = amf;
        await nextFrame();
      });

      it('Does nothing when node not found in path', () => {
        element._toggleSection({
          composedPath: () => []
        });
        // No error
      });

      it('Skips element without dataset property', () => {
        element._toggleSection({
          composedPath: () => [document.createTextNode('test')]
        });
      });

      it('Skips element without data-section attribute', () => {
        const node = document.createElement('span');
        element._toggleSection({
          composedPath: () => [node]
        });
      });

      it('Toggles section', () => {
        const node = document.createElement('span');
        node.dataset.section = 'endpoints';
        element._toggleSection({
          composedPath: () => [node]
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
        const id = element._endpoints[0].methods[0].id;
        element._selectMethodPassive(id);
        const node = element.shadowRoot.querySelector('.passive-selected');
        assert.equal(node.dataset.apiId, id);
      });

      it('Sets __hasPassiveSelection flag', () => {
        const id = element._endpoints[0].methods[0].id;
        element._selectMethodPassive(id);
        assert.isTrue(element.__hasPassiveSelection);
      });

      it('Renders toggle opened', () => {
        const id = element._endpoints[0].methods[0].id;
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
          currentTarget: node
        });
        assert.isTrue(spy.called);
        assert.isTrue(spy.args[0][0] === node);
      });

      it('Uses target as the target', () => {
        const node = element.shadowRoot.querySelector('.list-item.summary');
        const spy = sinon.spy(element, '_selectItem');
        element._itemClickHandler({
          target: node
        });
        assert.isTrue(spy.called);
        assert.isTrue(spy.args[0][0] === node);
      });

      it('Makes adjustemnts for method label', () => {
        const node = element.shadowRoot.querySelector('.method-label');
        const parent = node.parentNode;
        const spy = sinon.spy(element, '_selectItem');
        element._itemClickHandler({
          target: node
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

      it('Sets __effectiveQuery as a lowecase query', () => {
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

    describe('_computeRenderParth()', () => {
      let amf;
      let element;

      beforeEach(async () => {
        amf = await AmfLoader.load(item[1]);
        element = await summaryFixture();
        element.amf = amf;
        await nextFrame();
      });

      it('Returns true when both arguments are true', () => {
        const result = element._computeRenderParth(true, true);
        assert.isTrue(result);
      });

      it('Returns false when allowPaths is false', () => {
        const result = element._computeRenderParth(false, true);
        assert.isFalse(result);
      });

      it('Returns false when allowPaths is not set', () => {
        const result = element._computeRenderParth(undefined, true);
        assert.isFalse(result);
      });

      it('Returns false when renderPath is false', () => {
        const result = element._computeRenderParth(true, false);
        assert.isFalse(result);
      });

      it('Returns false when renderPath is not set', () => {
        const result = element._computeRenderParth(true, undefined);
        assert.isFalse(result);
      });

      it('Returns false when both undefinerd', () => {
        const result = element._computeRenderParth(false, false);
        assert.isFalse(result);
      });

      it('Paths are hidden by default', () => {
        const endpoint = AmfHelper.getEndpoint(element, amf, '/about');
        const id = endpoint['@id'];
        const node = element.shadowRoot.querySelector(`.endpoint[data-endpoint-id="${id}"] .path-name`);
        assert.notOk(node);
      });

      it('Renders paths when "allowPaths" is set', async () => {
        element.allowPaths = true;
        await nextFrame();
        const endpoint = AmfHelper.getEndpoint(element, amf, '/about');
        const id = endpoint['@id'];
        const node = element.shadowRoot.querySelector(`.endpoint[data-endpoint-id="${id}"] .path-name`);
        assert.ok(node);
      });
    });
  });
});
