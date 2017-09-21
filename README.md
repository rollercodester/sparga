<br />

[![npm](http://img.shields.io/npm/v/sparga.svg)](https://www.npmjs.org/package/sparga)
[![travis](https://travis-ci.org/rollercodester/sparga.svg?branch=master)](https://travis-ci.org/rollercodester/sparga)
[![Dependency Status](https://david-dm.org/rollercodester/sparga.svg)](https://david-dm.org/rollercodester/sparga)

![sparga](https://user-images.githubusercontent.com/1450389/30691215-e68697de-9e7b-11e7-8d7c-a7a6e7c4d34c.jpg)

**S**ingle-**P**age **A**pplication **R**elay for **G**oogle **A**nalytics

### *Are you a Spargan?*

#### You can be if you need to relay hits from your single-page application to Google Analytics.

## Index

* [Installation](#installation)
* [Examples](#examples)
   * [Quick Start](#example1)
   * [Automatic click-streaming](#example2)
   * [Custom dimensions](#example3)
   * [Custom metrics](#example4)
   * [Native GA Settings (e.g. custom tracker)](#example5)
* [Default GA Settings](#defaultGaSettings)
* [Other Helper Functions](#otherHelperFunctions)

<a name="installation"></a>
## Installation
```javascript
npm install --save sparga
```

<a name="examples"></a>
## Examples

<a name="example1"></a>
### Quick Start

```javascript
// for ES6 clients
import Sparga from 'sparga'
// for non-ES6 clients
const Sparga = require('sparga').default

const sparga = new Sparga()

sparga.init('UA-123456-7')

//
// Now all page views in your SPA will
// automatically be tracked in GA.
//
// Additionally, all unhandled JavaScript
// exceptions will also be tracked.
//
```

<a name="example2"></a>
### Automatic click-stream handling

```javascript

const sparga = new Sparga()

sparga.init({
   gaSettings: 'UA-123456-7',
   autoCaptureClickEvents: true
})

//
// Now all mouse clicks in your SPA will
// automatically be tracked in GA.
//
```

<a name="example3"></a>
### Setting custom dimensions using developer friendly logical names

```javascript

const sparga = new Sparga()

sparga.init({
   gaSettings: 'UA-123456-7',
   //
   // your dimension map will likely be governed
   // by a central team as GA only allows a limited
   // number of custom dimensions, depending on your
   // account type...as such, this map is usually
   // defined once and use many times for an organiation
   //
   // For more info, see https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#customs
   //
   dimensionMap: {
      variantTestName: 'dimension1',
      variantTestSampling: 'dimension9',
      userRole: 'dimension17'
   }
})

sparga.setDimension('variantTestName', 'Variant Testing for Our Exciting New Feature')
sparga.setDimension('variantTestSampling', 'Customers in US having more than 100 users.')
sparga.setDimension('userRole', 'non-admin')
```

<a name="example4"></a>
### Setting custom metrics using developer friendly logical names

```javascript

const sparga = new Sparga()

sparga.init({
   gaSettings: 'UA-123456-7',
   //
   // your metric map will likely be governed
   // by a central team as GA only allows a limited
   // number of custom metrics, depending on your
   // account type...as such, this map is usually
   // defined once and use many times for an organiation
   //
   // For more info, see https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#customs
   //
   metricMap: {
      isNewUser: 'metric6',
      isUserAdmin: 'metric8',
      isViewSetAsPersistent: 'metric14'
   }
})

sparga.setMetric('isNewUser', 1)
sparga.setMetric('isUserAdmin', 0)
sparga.setMetric('isViewSetAsPersistent', 1)
```

<a name="example5"></a>
### Using native GA settings

All native options for creating a GA tracking session are exposed via the gaSettings property on Sparga's intitialization object. The following example shows how to create a custom tracker by initializing with a gaSettings object.

```javascript

const sparga = new Sparga()

sparga.init({
   gaSettings: {
      trackingId: 'UA-123456-7',
      name: 'My Tracker'
   },
   metricMap: {
      isNewUser: 'metric6',
      isUserAdmin: 'metric8',
      isViewSetAsPersistent: 'metric14'
   }
})

//
// set custom metrics on the "My Tracker" tracker
//
sparga.setMetric('isNewUser', 1)
sparga.setMetric('isUserAdmin', 0)
sparga.setMetric('isViewSetAsPersistent', 1)
```

<a name="defaultGaSettings"></a>
## Default GA Settings

Sparga sets the following GA settings by default, which are different than the defaults that GA applies. As with all settings, these are overridable by passing in the respective key-value pairs on the gaSettings property of the options object.

* allowAnchor: false
* alwaysSendReferrer: true
* forceSSL: true
* cookieDomain: 'auto'
* siteSpeedSampleRate: 100
* storeGac: false


<a name="otherHelperFunctions"></a>
## Other Helper Functions

* sendEvent
* sendException
* sendSocial
* sendTiming

Refer to the [API.doc](https://github.com/rollercodester/sparga/blob/master/API.md) for more details.