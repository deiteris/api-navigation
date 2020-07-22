import { fixture, assert, html } from '@open-wc/testing';
import { AmfLoader } from './amf-loader.js';
import '../api-navigation.js';

describe('OAS external documentation computations', () => {
  async function basicFixture(amf) {
    return fixture(html`<api-navigation .amf="${amf}"></api-navigation>`);
  }

  [
    ['Regular model', false],
    ['Compact model', true],
  ].forEach(([label, compact]) => {
    describe(String(label), () => {
      describe('Data computations', () => {
        let element;
        let amf;

        before(async () => {
          amf = await AmfLoader.load(compact, 'ext-docs');
        });

        beforeEach(async () => {
          element = await basicFixture(amf);
        });

        it('has _docs', () => {
          assert.lengthOf(element._docs, 1, 'has 1 docs items');
          assert.isTrue(element.hasDocs, 'hasDocs is set');
        });

        it('computes URL value', () => {
          const [doc] = element._docs;
          assert.equal(doc.url, 'https://example.com');
        });

        it('computes isExternal value', () => {
          const [doc] = element._docs;
          assert.isTrue(doc.isExternal);
        });
      });

      describe('View rendering', () => {
        let element;
        let amf;

        before(async () => {
          amf = await AmfLoader.load(compact, 'ext-docs');
        });

        beforeEach(async () => {
          element = await basicFixture(amf);
        });

        it('renders list item with anchor', () => {
          const node = element.shadowRoot.querySelector('a.list-item');
          assert.ok(node, 'node is rendered');
        });

        it('opens anchor in a new tab', () => {
          const node = element.shadowRoot.querySelector('a.list-item');
          assert.equal(node.getAttribute('target'), '_blank');
        });

        it('has external URL', () => {
          const node = element.shadowRoot.querySelector('a.list-item');
          assert.equal(node.getAttribute('href'), 'https://example.com');
        });
      });

      describe('Invalid URL', () => {
        let element;
        let amf;

        before(async () => {
          amf = await AmfLoader.load(compact, 'APIC-449');
        });

        beforeEach(async () => {
          element = await basicFixture(amf);
        });

        it('URL default to about:blank when invalid', () => {
          const node = element.shadowRoot.querySelector('a.list-item');
          assert.equal(node.getAttribute('href'), 'about:blank');
        });
      });
    });
  });
});
