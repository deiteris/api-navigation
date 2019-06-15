[![Published on NPM](https://img.shields.io/npm/v/@api-components/api-navigation.svg)](https://www.npmjs.com/package/@api-components/api-navigation)

[![Build Status](https://travis-ci.org/advanced-rest-client/api-navigation.svg?branch=stage)](https://travis-ci.org/advanced-rest-client/api-navigation)

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/advanced-rest-client/api-navigation)

## &lt;api-navigation&gt;

A navigation for an API spec generated from AMF ld+json model.

### API components

This components is a part of [API components ecosystem](https://elements.advancedrestclient.com/)

## Usage

### Installation
```
npm install --save @api-components/api-navigation
```

### In an html file

```html
<html>
  <head>
    <script type="module">
      import '@api-components/api-navigation/api-navigation.js';
    </script>
  </head>
  <body>
    <api-navigation amf-model="..."></api-navigation>
  </body>
</html>
```

### In a Polymer 3 element

```js
import { LitElement, html } from 'lit-element';
import '@api-components/api-navigation/api-navigation.js';

class SampleElement extends LitElement {
  render() {
    return html`
    <api-navigation amf-model="${this.model}"></api-navigation>
    `;
  }
}
customElements.define('sample-element', SampleElement);
```

### Installation

```sh
git clone https://github.com/advanced-rest-client/api-navigation
cd api-navigation
npm install
```

### Running the demo locally

```sh
npm start
```

### Running the tests
```sh
npm test
```
