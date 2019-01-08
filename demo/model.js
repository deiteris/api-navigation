const generator = require('@api-components/api-model-generator');

const files = new Map();
files.set('demo-api/demo-api.raml', 'RAML 1.0');
files.set('types-list/types-list.raml', 'RAML 1.0');
files.set('exchange-experience-api/exchange-experience-api.raml', 'RAML 0.8');
files.set('oauth1-fragment/oauth1-fragment.raml', 'RAML 1.0');
files.set('oauth2-fragment/oauth2-fragment.raml', 'RAML 1.0');
files.set('type-fragment/type-fragment.raml', 'RAML 1.0');
files.set('documentation-fragment/documentation-fragment.raml', 'RAML 1.0');
files.set('lib-fragment/lib-fragment.raml', 'RAML 1.0');
files.set('example-fragment/example-fragment.raml', 'RAML 1.0');
files.set('missing-endpoints/missing-endpoints.raml', 'RAML 1.0');
generator(files)
.then(() => console.log('Finito'));
