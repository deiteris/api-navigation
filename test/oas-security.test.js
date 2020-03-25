import { fixture, assert, html } from '@open-wc/testing';
import { AmfLoader } from './amf-loader.js';
import '../api-navigation.js';

describe('OAS security computations', () => {
  async function basicFixture(amf) {
    return (await fixture(html`<api-navigation .amf="${amf}"></api-navigation>`));
  }

  [
    ['Regular model', false],
    ['Compact model', true]
  ].forEach(([label, compact]) => {
    describe(label, () => {

      describe('API Keys', () => {
        let element;
        let amf;

        before(async () => {
          amf = await AmfLoader.load(compact, 'api-keys');
        });

        beforeEach(async () => {
          element = await basicFixture(amf);
        });

        it('computes names in the _security model', () => {
          assert.lengthOf(element._security, 4, 'has all security items');
          assert.equal(element._security[0].label, 'clientQuery - Api Key', 'has name for clientQuery');
          assert.equal(element._security[1].label, 'clientSecret - Api Key', 'has name for clientSecret');
          assert.equal(element._security[2].label, 'clientCookie - Api Key', 'has name for clientCookie');
          assert.equal(element._security[3].label, 'clientMulti - Api Key', 'has name for clientMulti');
        });

        it('renbders security items', () => {
          const nodes = element.shadowRoot.querySelectorAll('.security .list-item');
          assert.lengthOf(nodes, 4, 'has all security items');
          assert.equal(nodes[0].textContent.trim(), 'clientQuery - Api Key', 'has name for clientQuery');
          assert.equal(nodes[1].textContent.trim(), 'clientSecret - Api Key', 'has name for clientSecret');
          assert.equal(nodes[2].textContent.trim(), 'clientCookie - Api Key', 'has name for clientCookie');
          assert.equal(nodes[3].textContent.trim(), 'clientMulti - Api Key', 'has name for clientMulti');
        });
      });

      describe('Bearer token', () => {
        let element;
        let amf;

        before(async () => {
          amf = await AmfLoader.load(compact, 'oas-bearer');
        });

        beforeEach(async () => {
          element = await basicFixture(amf);
        });

        it('computes names in the _security model', () => {
          assert.lengthOf(element._security, 2, 'has all security items');
          assert.equal(element._security[0].label, 'bearerAuth - HTTP', 'has name for bearerAuth');
          assert.equal(element._security[1].label, 'basicAuth - HTTP', 'has name for basicAuth');
        });

        it('renbders security items', () => {
          const nodes = element.shadowRoot.querySelectorAll('.security .list-item');
          assert.lengthOf(nodes, 2, 'has all security items');
          assert.equal(nodes[0].textContent.trim(), 'bearerAuth - HTTP', 'has name for bearerAuth');
          assert.equal(nodes[1].textContent.trim(), 'basicAuth - HTTP', 'has name for basicAuth');
        });
      });

      describe('OAuth 2', () => {
        let element;
        let amf;

        before(async () => {
          amf = await AmfLoader.load(compact, 'oauth-flows');
        });

        beforeEach(async () => {
          element = await basicFixture(amf);
        });

        it('computes names in the _security model', () => {
          assert.lengthOf(element._security, 1, 'has all security items');
          assert.equal(element._security[0].label, 'oAuthSample - OAuth 2.0', 'has name for oAuthSample');
        });

        it('renbders security items', () => {
          const nodes = element.shadowRoot.querySelectorAll('.security .list-item');
          assert.lengthOf(nodes, 1, 'has all security items');
          assert.equal(nodes[0].textContent.trim(), 'oAuthSample - OAuth 2.0', 'has name for oAuthSample');
        });
      });

      describe('OAS combo', () => {
        let element;
        let amf;

        before(async () => {
          amf = await AmfLoader.load(compact, 'oas-demo');
        });

        beforeEach(async () => {
          element = await basicFixture(amf);
        });

        it('computes names in the _security model', () => {
          assert.lengthOf(element._security, 6, 'has all security items');
          assert.equal(element._security[0].label, 'ApiKeyAuth - Api Key', 'has name for ApiKeyAuth');
          assert.equal(element._security[1].label, 'OpenID - OpenID Connect', 'has name for OpenID');
          assert.equal(element._security[2].label, 'OAuth2 - OAuth 2.0', 'has name for OAuth2');
          assert.equal(element._security[3].label, 'BasicAuth - HTTP', 'has name for BasicAuth');
          assert.equal(element._security[4].label, 'BearerAuth - HTTP', 'has name for BearerAuth');
          assert.equal(element._security[5].label, 'ApiKeyQuery - Api Key', 'has name for ApiKeyQuery');
        });

        it('renbders security items', () => {
          const nodes = element.shadowRoot.querySelectorAll('.security .list-item');
          assert.lengthOf(nodes, 6, 'has all security items');
          assert.equal(nodes[0].textContent.trim(), 'ApiKeyAuth - Api Key', 'has name for ApiKeyAuth');
          assert.equal(nodes[1].textContent.trim(), 'OpenID - OpenID Connect', 'has name for OpenID');
          assert.equal(nodes[2].textContent.trim(), 'OAuth2 - OAuth 2.0', 'has name for OAuth2');
          assert.equal(nodes[3].textContent.trim(), 'BasicAuth - HTTP', 'has name for BasicAuth');
          assert.equal(nodes[4].textContent.trim(), 'BearerAuth - HTTP', 'has name for BearerAuth');
          assert.equal(nodes[5].textContent.trim(), 'ApiKeyQuery - Api Key', 'has name for ApiKeyQuery');
        });
      });

    });
  });
});
