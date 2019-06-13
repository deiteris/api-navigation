import { fixture, assert, nextFrame } from '@open-wc/testing';
import { AmfLoader } from './amf-loader.js';
import '../api-navigation.js';

describe('Security fragment', () => {
  async function basicFixture() {
    return (await fixture(`<api-navigation></api-navigation>`));
  }

  [
    ['Regular model', false],
    ['Compact model', true]
  ].forEach((item) => {
    describe(item[0], () => {
      let element;

      beforeEach(async () => {
        const amfModel = await AmfLoader.load(item[1], 'oauth2-fragment');
        element = await basicFixture();
        element.amfModel = amfModel;
        await nextFrame();
      });

      it('Documentaion is undefined', () => {
        assert.isUndefined(element._docs);
      });

      it('Types is undefined', () => {
        assert.isUndefined(element._types);
      });

      it('Security is computed', () => {
        const result = element._security;
        assert.lengthOf(result, 1);
        assert.typeOf(result[0].id, 'string');
        assert.equal(result[0].label, 'OAuth 2.0');
      });

      it('Endpoints is undefined', () => {
        assert.isUndefined(element._endpoints);
      });

      it('Security is opened', () => {
        assert.isTrue(element.securityOpened);
      });

      it('_isFragment is set', () => {
        assert.isTrue(element._isFragment);
      });

      it('_renderSummary is false', () => {
        assert.isFalse(element._renderSummary);
      });

      it('summary is not rendered', async () => {
        await nextFrame();
        const panel = element.shadowRoot.querySelector('.summary');
        assert.notOk(panel);
      });
    });
  });
});
