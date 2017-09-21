import createHistory from 'history/createBrowserHistory'


/**
 * @exports sparga
 * @typicalname sparga
 */

/**
 * Google Analytics settings object that determines values set at creation time for tracker fields. Although all fields are supported, only a subset are specified here, particularly those where Sparga defaults to a different value than Google does. See https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#create for field definitions.
 * @typedef {object} GASettings
 * @property {string} trackingId - Your GA tracking ID (e.g. "UA-XXXX-Y...")
 * @property {boolean} [allowAnchor=false]
 * @property {boolean} [alwaysSendReferrer=true]
 * @property {boolean} [forceSSL=true]
 * @property {number} [siteSpeedSampleRate=100]
 * @property {boolean} [storeGac=false]
 */

/**
 * Literal object containing key-value pairs of custom GA dimension maps. Each property key is a logical "friendly" dimension name that developers will use in code. Each property value is the actual GA dimension name (e.g. dimension14).
 * @typedef {object} DimensionMap
 * @example <caption>For example</caption>
 * {
 *    variantTestName: 'dimension1',
 *    variantTestSampling: 'dimension2',
 *    userRole: 'dimension3'
 * }
 */

/**
 * Literal object containing key-value pairs of custom GA metric maps. Each property key is a logical "friendly" metric name that developers will use in code. Each property value is the actual GA metric name (e.g. metric5).
 * @typedef {object} MetricMap
 * @example <caption>For example</caption>
 * {
 *    isNewUser: 'metric4',
 *    isUserAdmin: 'metric15',
 *    isViewSetAsPersistent: 'metric9'
 * }
 */

/**
 * Options object used when initializing Sparga.
 * @typedef {object} SpargaOptions
 * @property {boolean} autoCaptureClickEvents - Determines whether or not all mouse click events are automatically captured and sent to GA.
 * @property {GASettings|string} gaSettings - Either an object literal that defines the "GA create" settings OR your GA tracking ID (e.g. "UA-XXXX-Y...").
 * @property {DimensionMap} dimensionMap - Defines map of custom GA dimensions that developers can use.
 * @property {MetricMap} metricMap - Defines map of custom GA metrics that developers can use.
 */

export default class Sparga {

   /**
    * Initializes a tracker in GA and wires-up automated features of Sparga.
    * @param {SpargaOptions|string} options - Specifies initialization settings for Sparga or your GA tracking ID.
    */
   init(options) {

      if (typeof options === 'string') {

         //
         // assume just the GA tracking ID was passed, so
         // re-assign options with object
         //
         options = {
            gaSettings: {
               trackingId: options
            }
         }

      }

      const { autoCaptureClickEvents = false, dimensionMap = {}, metricMap = {} } = options
      let { gaSettings } = options

      if (typeof gaSettings === 'string') {

         // assume just the GA tracking ID was passed
         gaSettings = {
            trackingId: gaSettings
         }

      } else if ( !(!!gaSettings) && (gaSettings.constructor === Object) ) {

         gaSettings = null

      }

      if (!gaSettings|| typeof gaSettings.trackingId !== 'string') {

         throw new Error('Sparga must be initialized with options.gaSettings either being a literal object or a string containing a GA tracking ID (e.g. "UA-XXXX-Y..."). Refer to the Readme.md file for more information.')

      }

      //
      // mutate final gaSettings, using defaults
      //
      gaSettings = Object.assign({}, {
         allowAnchor: false,
         alwaysSendReferrer: true,
         forceSSL: true,
         cookieDomain: 'auto',
         siteSpeedSampleRate: 100,
         storeGac: false
      }, gaSettings)

      // set the GA command names based on whether
      // or not a custom tracker name was initialized
      this.sendCommand = gaSettings.name ? `${gaSettings.name}.send` : 'send'
      this.setCommand = gaSettings.name ? `${gaSettings.name}.set` : 'set'

      //
      // store the custom metric/dimension
      // maps that will support the respective
      // set functions exposed by spaga
      //
      this.dimensionMap = dimensionMap
      this.metricMap = metricMap

      this.__initExceptionListener()
      this.__initClickListener(autoCaptureClickEvents)

      if (typeof window !== 'undefined') {

         if (!window.ga) {

            this.__initGa()
            this.__initHistoryListener()

            //
            // initialize GA (one-time only)
            //
            window.ga('create', gaSettings)

            //
            // since the initial load of a SPA
            // won't trigger a pushState, go
            // ahead and send a pageview hit
            //
            window.ga(this.sendCommand, {
               hitType: 'pageview',
               page: location.pathname
            })

         }

      } else {

         throw new Error('Sparga is intended for browser environments only.')

      }

   }

   /**
    * Pass-thru method for the GA send command. For method signature, see https://developers.google.com/analytics/devguides/collection/analyticsjs/command-queue-reference#send
    */
   send() {

      window.ga(this.sendCommand, arguments)

   }

   /**
    * Helper method to send a hit of type "event" to GA.
    * @param {string} category
    * @param {string} action
    * @param {string} label
    * @param {number} value
    */
   sendEvent(category, action, label, value) {

      const trueValue = parseInt(value)

      window.ga(this.sendCommand, {
         hitType: 'event',
         eventCategory: category,
         eventAction: action,
         eventLabel: label,
         eventValue: isNaN(trueValue) ? undefined : trueValue
      })

   }

   /**
    * Helper method to send a hit of type "exception" to GA.
    * @param {string} errMessage
    * @param {boolean} wasFatal
    */
   sendException(errMessage, wasFatal) {

      window.ga(this.sendCommand, {
         hitType: 'exception',
         exDescription: errMessage,
         exFatal: wasFatal
      })

   }

   /**
    * Helper method to send a hit of type "social" to GA.
    * @param {string} network - The social networking site (e.g. Facebook)
    * @param {string} action - The social action (e.g. like)
    * @param {string} target - The subject of the action (e.g. name of post, URL, etc.)
    */
   sendSocial(network, action, target) {

      window.ga(this.sendCommand, {
         hitType: 'social',
         socialNetwork: network,
         socialAction: action,
         socialTarget: target
      })

   }

   /**
    * Helper method to send a hit of type "timing" to GA.
    * @param {string} category
    * @param {string} variable
    * @param {string} label
    * @param {date|number} startOrDuration - Either a Date object depicting the start of an operation that is being timed OR an integer depicting the elapsed duration of the respective operation
    * @param {date=} stop - An optional Date object depicting the end of an operation that is being timed.
    */
   sendTiming(category, variable, label, startOrDuration, stop) {

      let wasSent = false
      let duration

      if (startOrDuration instanceof Date) {

         //
         // make the stop param optional and assume
         // that stop time is now if not provided
         //
         stop = stop instanceof Date ? stop : new Date()

         duration = stop.getTime() - startOrDuration.getTime()

      } else {

         duration = parseInt(startOrDuration)

      }

      if (duration) {

         window.ga(this.sendCommand, {
            hitType: 'timing',
            timingCategory: category,
            timingVar: variable,
            timingValue: duration,
            timingLabel: label
         })

         wasSent = true

      } else {

         console.warn('A Sparga.sendTiming method call was ignored because neither a valid Date nor a Number was passed into the startOrDuration parameter.')

      }

      return wasSent

   }

   /**
    * Helper method to set a custom dimension in GA.
    * @param {string} name - Logical "friendly" name of the custom dimension. Refer to @DimensionMap for more information.
    * @param {string} value - The value to set the dimension to for respective tracker session.
    */
   setDimension(name, value) {

      let wasSet = false

      if (this.dimensionMap.hasOwnProperty(name)) {

         window.ga(this.setCommand, this.dimensionMap[name], value)

         wasSet = true

      } else {

         console.warn(`A Sparga.setDimension method call was ignored because the key ${name} was not found in the provided dimensionMap.`)

      }

      return wasSet

   }

   /**
    * Helper method to set a custom metric in GA.
    * @param {string} name - Logical "friendly" name of the custom metric. Refer to @MetricMap for more information.
    * @param {number} value - The value to set the metric to for respective tracker session.
    */
   setMetric(name, value) {

      let wasSet = false

      if (this.metricMap.hasOwnProperty(name)) {

         const trueValue = typeof value === 'number' ? value : parseFloat(value)

         if (!isNaN(trueValue)) {

            window.ga(this.setCommand, this.metricMap[name], value)

            wasSet = true

         } else {

            console.warn(`A Sparga.setMetric method call was ignored because the value ${value} could not be parsed as a valid Number.`)

         }

      } else {

         console.warn(`A Sparga.setMetric method call was ignored because the key ${name} was not found in the provided metricMap.`)

      }

      return wasSet

   }


   //
   //
   // logically private methods
   //
   //
   //

   __initClickListener(autoCaptureClickEvents) {

      const ref = this

      const clickListener = function(clickEvent) {

         const { toElement, x, y } = clickEvent
         const { id, className } = toElement

         const label = {
            id: id,
            className: className,
            x: x,
            y: y
         }

         ref.sendEvent('Mouse', 'Click', JSON.stringify(label))

      }

      if (autoCaptureClickEvents) {

         //
         // wire up a listener to capture all
         // click events so they can be sent to GA
         //
         window.document.addEventListener('click', clickListener)

      } else {

         //
         // assume listener was attached, so un-wire it
         //
         window.document.removeEventListener('click', clickListener)

      }

   }

   __initExceptionListener() {

      const ref = this

      //
      // wire up a listener to capture all
      // unhandled JavaScript exceptions so
      // they can be sent to GA
      //

      window.onerror = function(msg, url, line, col, error) {

         const formattedError = `Error: ${msg}${url ? `\nURL: ${url}` : ''}${line ? `\nLine: ${line}` : ''}${col ? `\nColumn: ${col}` : ''}`
         ref.sendException(formattedError)

      }

   }

   __initGa() {

      //
      // dynamically embed the GA analytics library
      //
      (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script','https://www.google-analytics.com/analytics.js','ga')

   }

   __initHistoryListener() {

      const ref = this

      //
      // monkey-patch pushState to create a history listener
      // to capture all view changes so that pageview events
      // can be automatically sent to GA
      //
      const pushState = history.pushState
      history.pushState = function() {

         pushState.apply(history, arguments)

         window.ga(ref.sendCommand, {
            hitType: 'pageview',
            page: location.pathname
         })

      }

   }

}
