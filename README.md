# DEPRECATED

This component is being deprecated. The code base has been moved to [amf-components](https://github.com/advanced-rest-client/amf-components) module. This module will be archived when [PR 1](https://github.com/advanced-rest-client/amf-components/pull/1) is merged.

-----

[![Published on NPM](https://img.shields.io/npm/v/@api-components/api-navigation.svg)](https://www.npmjs.com/package/@api-components/api-navigation)

[![Tests and publishing](https://github.com/advanced-rest-client/api-navigation/actions/workflows/deployment.yml/badge.svg)](https://github.com/advanced-rest-client/api-navigation/actions/workflows/deployment.yml)

A navigation for an API spec generated from AMF ld+json model.

## Version compatibility

This version only works with AMF model version 2 (AMF parser >= 4.0.0).
For compatibility with previous model version use `3.x.x` version of the component.

## Usage

### Installation

```sh
npm install @api-components/api-navigation --save
```

The element works with [AMF](https://github.com/mulesoft/amf) json/ld model. When the model is set it computes list of documentation nodes, types, endpoints, methods and security schemas.  As a result user can select any of the items in the UI and the application is informed about user choice via custom event.

The selection is a selected API shape `@id`. The application is responsible for computing the model selected by the user.

Note, this element does not contain polyfills for Array platform features.

**Passive navigation**

Passive navigation means that a navigation event occurred but it wasn't invoked by intentional user interaction.
For example `api-endpoint-documentation` component renders list of documentations for HTTP methods.
While scrolling through the list navigation context changes (user reads documentation of a method) but the navigation never  was caused by user intentional interaction. This event, annotated with `passive: true` property in the detail object, prohibits other element from taking a navigation action but some may reflect the change in the UI.

### In an html file

```html
<html>
  <head>
    <script type="module">
      import '@api-components/api-navigation/api-navigation.js';
    </script>
  </head>
  <body>
    <api-navigation amf="..."></api-navigation>
  </body>
</html>
```

### In a LitElement

```js
import { LitElement, html } from 'lit-element';
import '@api-components/api-navigation/api-navigation.js';

class SampleElement extends LitElement {
  render() {
    return html`
    <api-navigation
      .amf="${this.amf}"
      @api-navigation-selection-changed="${this._navigationHandler}"></api-navigation>
    `;
  }

  _navigationHandler(e) {
    const { selected, type, endpointId, passive } = e.detail;
  }
}
customElements.define('sample-element', SampleElement);
```

## Development

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
