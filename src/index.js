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
 * Literal object containing key-value pairs of tracker maps. Each property key is a logical "friendly" tracker name that developers will use in code. Each property value is the actual tracking ID (e.g. "UA-XXXX-Y...").
 * @typedef {object} TrackerMap
 * @example <caption>For example</caption>
 * {
 *    myWebProperty1: 'UA-XXXX-Y',
 *    myWebProperty2: 'UA-XXXX-Z'
 * }
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
 * @property {boolean} [autoCapturePageviews=true] - Determines whether or not all page views are automatically captured and sent to GA.
 * @property {boolean} [autoCaptureExceptions=true] - Determines whether or not all JavaScript exceptions are automatically captured and sent to GA.
 * @property {boolean} [autoCaptureClickEvents=false] - Determines whether or not all mouse click events are automatically captured and sent to GA.
 * @property {GASettings|string} gaSettings - Either an object literal that defines the "GA create" settings OR your GA tracking ID (e.g. "UA-XXXX-Y...").
 * @property {TrackerMap=} trackerMap - Defines map of multiple trackers that developers can use.
 * @property {DimensionMap=} dimensionMap - Defines map of custom GA dimensions that developers can use.
 * @property {MetricMap=} metricMap - Defines map of custom GA metrics that developers can use.
 */

export default class Sparga {

   /**
    * Initializes one or more trackers in GA and wires-up automated features of Sparga.
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

      const { autoCaptureClickEvents = false, autoCaptureExceptions = true, autoCapturePageviews = true, dimensionMap = {}, metricMap = {}, trackerMap } = options
      let { gaSettings } = options

      if (typeof gaSettings === 'string') {

         // assume just the GA tracking ID was passed
         gaSettings = {
            trackingId: gaSettings
         }

      } else if ( !(!!gaSettings) && (gaSettings.constructor === Object) ) {

         gaSettings = null

      }

      if ( (!gaSettings|| typeof gaSettings.trackingId !== 'string') && (!trackerMap || !this.__isPlainObject(trackerMap)) )  {

         throw new Error('Sparga must be initialized with options.gaSettings either being a literal object or a string containing a GA tracking ID (e.g. "UA-XXXX-Y..."), OR a map of trackers must be provided using options.trackerMap. Refer to the Readme.md file for more information.')

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

      // make sure there is no name property supplied
      delete gaSettings.name

      //
      // store the maps that will support
      // set/send functions exposed by spaga
      //
      this.trackerMap = trackerMap
      this.dimensionMap = dimensionMap
      this.metricMap = metricMap

      this.__initExceptionListener(autoCaptureExceptions)
      this.__initClickListener(autoCaptureClickEvents)

      if (typeof window !== 'undefined') {

         if (!window.ga) {

            this.__initGa()

            if (this.trackerMap) {

               const alphaOnlyRegex = /^[a-z0-9]+$/i
               const { cookieDomain } = gaSettings

               if (gaSettings.trackingId) {

                  console.warn('The options.gaSettings.trackingId was supplied in addition to options.trackerMap; Sparga will only use the trackerMap and will ignore the gaSettings.trackingId.')

               }

               delete gaSettings.trackingId
               delete gaSettings.name

               //
               // initialize GA for each provided tracker
               //

               const trackerNames = Object.keys(this.trackerMap)

               for (const trackerName of trackerNames) {

                  if (alphaOnlyRegex.test(trackerName)) {

                     const trackerId = this.trackerMap[trackerName]
                     window.ga('create', trackerId, cookieDomain, trackerName, gaSettings)

                  } else {

                     throw new Error(`The tracker name "${trackerName}" is invalid. Only alphanumeric characters are allowed with no spaces.`)

                  }

               }

            } else {

               //
               // initialize GA using provided gaSettings
               //
               window.ga('create', gaSettings)

            }

            this.__initHistoryListener(autoCapturePageviews)

         }

      } else {

         throw new Error('Sparga is intended for browser environments only.')

      }

   }

   /**
    * Pass-thru method for the GA send command. For method signature, see https://developers.google.com/analytics/devguides/collection/analyticsjs/command-queue-reference#send
    */
   send() {

      this.__send(arguments)

   }

   /**
    * Helper method to send a hit of type "event" to GA.
    * @param {string} category
    * @param {string} action
    * @param {string} label
    * @param {number} value
    * @param {array=} trackerNames - Provide if a trackerMap is being used and you only want a subset of trackers to receive this hit.
    */
   sendEvent(category, action, label, value, trackerNames) {

      const trueValue = parseInt(value)
      const sendObject = {
         hitType: 'event',
         eventCategory: category,
         eventAction: action,
         eventLabel: label,
         eventValue: isNaN(trueValue) ? undefined : trueValue
      }

      this.__send(sendObject, trackerNames)

   }

   /**
    * Helper method to send a hit of type "exception" to GA.
    * @param {string} errMessage
    * @param {boolean} wasFatal
    * @param {array=} trackerNames - Provide if a trackerMap is being used and you only want a subset of trackers to receive this hit.
    */
   sendException(errMessage, wasFatal, trackerNames) {

      const sendObject = {
         hitType: 'exception',
         exDescription: errMessage,
         exFatal: wasFatal
      }

      this.__send(sendObject, trackerNames)

   }

   /**
    * Helper method to send a hit of type "pageview" to GA.
    * @param {string} pageView
    */
   sendPageView(pageView) {

      this.__send({
         hitType: 'pageview',
         page: pageView
      })

   }

   /**
    * Helper method to send a hit of type "social" to GA.
    * @param {string} network - The social networking site (e.g. Facebook)
    * @param {string} action - The social action (e.g. like)
    * @param {string} target - The subject of the action (e.g. name of post, URL, etc.)
    * @param {array=} trackerNames - Provide if a trackerMap is being used and you only want a subset of trackers to receive this hit.
    */
   sendSocial(network, action, target, trackerNames) {

      const sendObject = {
         hitType: 'social',
         socialNetwork: network,
         socialAction: action,
         socialTarget: target
      }

      this.__send(sendObject, trackerNames)

   }

   /**
    * Helper method to send a hit of type "timing" to GA.
    * @param {string} category
    * @param {string} variable
    * @param {string} label
    * @param {date|number} startOrDuration - Either a Date object depicting the start of an operation that is being timed OR an integer depicting the elapsed duration of the respective operation
    * @param {date=} stop - An optional Date object depicting the end of an operation that is being timed.
    * @param {array=} trackerNames - Provide if a trackerMap is being used and you only want a subset of trackers to receive this hit.
    */
   sendTiming(category, variable, label, startOrDuration, stop, trackerNames) {

      let wasSent = false
      let duration

      if (!trackerNames && stop instanceof Array) {

         trackerNames = stop
         stop = null

      }

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

         const sendObject = {
            hitType: 'timing',
            timingCategory: category,
            timingVar: variable,
            timingValue: duration,
            timingLabel: label
         }

         this.__send(sendObject, trackerNames)

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
    * @param {array=} trackerNames - Provide if a trackerMap is being used and you only want a subset of trackers to receive this dimension.
    */
   setDimension(name, value, trackerNames) {

      let wasSet = false

      if (this.dimensionMap && this.dimensionMap.hasOwnProperty(name)) {

         this.__set(this.dimensionMap[name], value, trackerNames)
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
    * @param {array=} trackerNames - Provide if a trackerMap is being used and you only want a subset of trackers to receive this metric.
    */
   setMetric(name, value, trackerNames) {

      let wasSet = false

      if (this.metricMap && this.metricMap.hasOwnProperty(name)) {

         const trueValue = typeof value === 'number' ? value : parseFloat(value)

         if (!isNaN(trueValue)) {

            this.__set(this.metricMap[name], value, trackerNames)
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

   __initExceptionListener(autoCaptureExceptions) {

      if (autoCaptureExceptions) {

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

   __initHistoryListener(autoCapturePageviews) {

      if (autoCapturePageviews) {

         const ref = this

         //
         // since the initial load of a SPA
         // won't trigger a pushState, go
         // ahead and send a pageview hit
         //
         ref.sendPageView(location.pathname)

         //
         // monkey-patch pushState to create a history listener
         // to capture all view changes so that pageview events
         // can be automatically sent to GA
         //
         const pushState = history.pushState
         history.pushState = function() {

            pushState.apply(history, arguments)
            ref.sendPageView(location.pathname)

         }

      }

   }

   __isPlainObject(val) {
      return val ? val.constructor === {}.constructor : false
   }

   __send(options, trackerNames) {

      if (trackerNames || this.trackerMap) {

         trackerNames = trackerNames || Object.keys(this.trackerMap)

         for (const trackerName of trackerNames) {

            if (this.trackerMap && this.trackerMap.hasOwnProperty(trackerName)) {

                window.ga(`${trackerName}.send`, options)

            } else {

               console.warn(`A send call was ignored because the provided trackerName ${trackerName} was not found in the provided trackerMap.`)

            }

         }

      } else {

         window.ga('send', options)

      }

   }

   __set(property, value, trackerNames) {

      if (trackerNames || this.trackerMap) {

         trackerNames = trackerNames || Object.keys(this.trackerMap)

         for (const trackerName of trackerNames) {

            if (this.trackerMap && this.trackerMap.hasOwnProperty(trackerName)) {

               window.ga(`${trackerName}.set`, property, value)

            } else {

               console.warn(`A set call was ignored because the provided trackerName ${trackerName} was not found in the provided trackerMap.`)

            }

         }

      } else {

         window.ga('set', property, value)

      }

   }

}
