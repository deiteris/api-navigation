import { fixture, assert, nextFrame } from '@open-wc/testing';
import { AmfLoader } from './amf-loader.js';
import { AmfHelper } from './amf-helper.js';
import '../api-navigation.js';

describe('AMF model test', () => {
  async function basicFixture() {
    return (await fixture(`<api-navigation></api-navigation>`));
  }

  describe('AMF Computations', () => {
    [
      ['Regular model', false],
      ['Compact model', true]
    ].forEach((item) => {
      describe(item[0], () => {
        let element;

        beforeEach(async () => {
          const amf = await AmfLoader.load(item[1]);
          element = await basicFixture();
          element.amf = amf;
          await nextFrame();
        });

        it('Collects documentation information', () => {
          const result = element._docs;
          assert.equal(result.length, 2);
          assert.typeOf(result[0].id, 'string');
          assert.typeOf(result[0].label, 'string');
        });

        it('Collects types information', () => {
          const result = element._types;
          assert.equal(result.length, 10);
          assert.typeOf(result[0].id, 'string');
          assert.typeOf(result[0].label, 'string');
        });

        it('Collects security information', () => {
          const result = element._security;
          assert.equal(result.length, 2);
          assert.typeOf(result[0].id, 'string');
          assert.typeOf(result[0].label, 'string');
        });

        it('Collects endpoints information', () => {
          const result = element._endpoints;
          assert.equal(result.length, 32);
          assert.typeOf(result[0].id, 'string');
          assert.typeOf(result[0].label, 'string');
          assert.typeOf(result[0].methods, 'array');
          assert.typeOf(result[0].renderPath, 'boolean');
        });

        it('Collects methods information', () => {
          const result = element._endpoints;
          const methods = result[0].methods;
          assert.equal(methods.length, 2);
          assert.typeOf(methods[0].id, 'string');
          assert.typeOf(methods[0].label, 'string');
          assert.typeOf(methods[0].method, 'string');
        });

        it('Collects types from a library', () => {
          const result = element._types;
          assert.lengthOf(result, 10);
          assert.equal(result[9].label, 'Type from library');
        });

        it('Types does not include inline declarations', () => {
          const result = element._types;
          for (let i = 0, len = result.length; i < len; i++) {
            assert.equal(result[i].label.indexOf('amf_inline_type'), -1);
          }
        });

        it('renderPath is set on endpoints', () => {
          const result = element._endpoints;
          let endpoint = result[0];
          assert.isTrue(endpoint.renderPath);
          endpoint = result[2];
          assert.isFalse(endpoint.renderPath);
        });

        it('Sets missing name as truncated path', () => {
          const result = element._endpoints;
          const endpoint = result[2];
          assert.equal(endpoint.label, '/copy');
        });
      });
    });
  });

  describe('AMF cache pipeline', () => {
    describe('When model contains URI IDs', () => {
      let element;

      beforeEach(async () => {
        const amf = await AmfLoader.load(false, 'APIC-349-cache-resolution');
        element = await basicFixture();
        element.amf = amf;
        await nextFrame();
      });

      it('Collects documentation information', () => {
        const result = element._docs;
        assert.equal(result.length, 4);
        assert.typeOf(result[0].id, 'string');
        assert.typeOf(result[0].label, 'string');
      });

      it('Collects types information', () => {
        const result = element._types;
        assert.equal(result.length, 9);
        assert.typeOf(result[0].id, 'string');
        assert.typeOf(result[0].label, 'string');
      });

      it('Collects endpoints information', () => {
        const result = element._endpoints;
        assert.equal(result.length, 5);
        assert.typeOf(result[0].id, 'string');
        assert.typeOf(result[0].label, 'string');
        assert.typeOf(result[0].methods, 'array');
        assert.typeOf(result[0].renderPath, 'boolean');
      });

      it('Collects methods information', () => {
        const result = element._endpoints;
        const methods = result[0].methods;
        assert.equal(methods.length, 1);
        assert.typeOf(methods[0].id, 'string');
        assert.typeOf(methods[0].method, 'string');
      });
    })
  })
  describe('data-endpoint-* attributes', () => {
    [
      ['Regular model', false],
      ['Compact model', true]
    ].forEach((item) => {
      describe(item[0], () => {
        let element;
        let amf;

        beforeEach(async () => {
          amf = await AmfLoader.load(item[1]);
          element = await basicFixture();
          element.amf = amf;
          await nextFrame();
        });

        it('Each endpoint item has data-endpoint-path attribute', () => {
          const nodes = element.shadowRoot.querySelectorAll('.list-item.endpoint');
          assert.isAbove(nodes.length, 1);
          for (let i = 0, len = nodes.length; i < len; i++) {
            assert.typeOf(nodes[i].dataset.endpointPath, 'string');
            assert.equal(nodes[i].dataset.endpointPath[0], '/');
          }
        });

        it('Each endpoint item has data-endpoint-id attribute', () => {
          const nodes = element.shadowRoot.querySelectorAll('.list-item.endpoint');
          assert.isAbove(nodes.length, 1);
          for (let i = 0, len = nodes.length; i < len; i++) {
            assert.typeOf(nodes[i].dataset.endpointId, 'string');
            assert.isAbove(nodes[i].dataset.endpointId.length, 0);
          }
        });
      });
    });
  });

  describe('_collectData()', () => {
    [
      ['Regular model', false],
      ['Compact model', true]
    ].forEach((item) => {
      describe(item[0], () => {
        let element;
        let amf;

        beforeEach(async () => {
          amf = await AmfLoader.load(item[1]);
          if (amf instanceof Array) {
            amf = amf[0];
          }
          element = await basicFixture();
          element.amf = amf;
          await nextFrame();
        });

        it('Returns empty model when no argument', () => {
          const result = element._collectData();
          assert.typeOf(result, 'object');
          assert.lengthOf(result.endpoints, 0);
        });

        it('Returns endpoints array', () => {
          const result = element._collectData(amf);
          assert.isAbove(result.endpoints.length, 1);
        });

        it('Deletes _typeIds', () => {
          const result = element._collectData(amf);
          assert.isUndefined(result._typeIds);
        });

        it('Deletes _basePaths', () => {
          const result = element._collectData(amf);
          assert.isUndefined(result._basePaths);
        });
      });
    });
  });

  describe('__amfChanged()', () => {
    [
      ['Regular model', false],
      ['Compact model', true]
    ].forEach((item) => {
      describe(item[0], () => {
        let element;
        let amf;

        beforeEach(async () => {
          amf = await AmfLoader.load(item[1]);
          if (amf instanceof Array) {
            amf = amf[0];
          }
          element = await basicFixture();
        });

        it('Does nothing when no model', () => {
          element.__amfChanged();
          // no error
        });

        it('Sets endpoints property', () => {
          element.amf = amf;
          assert.isAbove(element._endpoints.length, 1);
        });
      });
    });
  });

  describe('Passive selection', () => {
    let element;
    let amf;

    beforeEach(async () => {
      amf = await AmfLoader.load();
      element = await basicFixture();
      element.amf = amf;
      await nextFrame();
    });

    function dispatch(selected, type) {
      const e = new CustomEvent('api-navigation-selection-changed', {
        bubbles: true,
        composed: true,
        detail: {
          selected,
          type,
          passive: true
        }
      });
      document.body.dispatchEvent(e);
    }

    it('Selectes a method', () => {
      const method = AmfHelper.getMethod(element, amf, '/files', 'post');
      dispatch(method['@id'], 'method');
      const node = element.shadowRoot.querySelector('.passive-selected');
      assert.ok(node);
    });

    it('Opens iron-collapse', () => {
      const method = AmfHelper.getMethod(element, amf, '/files', 'post');
      dispatch(method['@id'], 'method');
      const endpoint = AmfHelper.getEndpoint(element, amf, '/files');
      const id = endpoint['@id'];
      const node = element.shadowRoot.querySelector(`.endpoint[data-endpoint-id="${id}"]`);
      assert.isTrue(node.nextElementSibling.opened);
    });
  });

  describe('Changing model', () => {
    let compactAmf;
    let amf;
    before(async () => {
      amf = await AmfLoader.load();
      compactAmf = await AmfLoader.load(true);
    });

    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element.amf = amf;
      await nextFrame();
    });

    it('closes methods collapse when changing model', async () => {
      const node = element.shadowRoot.querySelector('.operation-collapse');
      node.opened = true;
      await nextFrame();
      /* eslint-disable-next-line require-atomic-updates */
      element.amf = compactAmf;
      await nextFrame();
      assert.isFalse(node.opened);
    });
  });
});
