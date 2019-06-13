import { fixture, assert, nextFrame } from '@open-wc/testing';
import { AmfLoader } from './amf-loader.js';
import '../api-navigation.js';

describe('Type fragment', () => {
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
        const amfModel = await AmfLoader.load(item[1], 'type-fragment');
        element = await basicFixture();
        element.amfModel = amfModel;
        await nextFrame();
      });

      it('Documentaion is undefined', () => {
        assert.isUndefined(element._docs);
      });

      it('Types is computed', () => {
        const result = element._types;
        assert.lengthOf(result, 1);
        assert.typeOf(result[0].id, 'string');
        assert.equal(result[0].label, 'A person resource');
      });

      it('Security is undefined', () => {
        assert.isUndefined(element.security);
      });

      it('Endpoints is undefined', () => {
        assert.isUndefined(element._endpoints);
      });

      it('Types is opened', () => {
        assert.isTrue(element.typesOpened);
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
