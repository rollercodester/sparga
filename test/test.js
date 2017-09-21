const assert = require('assert')
const Sparga = require('../dist/sparga.min.js').default
const simple = require('simple-mock')

const FAKE_TRACKING_ID = '1111111111111'

const sparga = new Sparga()

let gaCall

describe('sparga', function() {

    before(() => {

        simple.mock(global, 'window').returnWith({})
        simple.mock(sparga, '__initClickListener').returnWith(null)
        simple.mock(sparga, '__initExceptionListener').returnWith(null)
        simple.mock(sparga, '__initHistoryListener').returnWith(null)

        simple.mock(sparga, '__initGa').callFn(function() {

            gaCall = simple.mock(global.window, 'ga').returnWith(null)

        })

    })

    after(() => {

        simple.restore()

    })

    beforeEach(() => {


    })

    afterEach(() => {



    })

    describe('init', function() {

        it('should NOT throw if initialized with a string', function() {

            assert.doesNotThrow(() => {

                sparga.init(FAKE_TRACKING_ID)

            })


        })

        it('should throw if gaSettings property is missing when initializing with object literal', function() {

            assert.throws(() => {

                sparga.init({})

            }, Error)

        })

        it('should NOT throw if gaSettings is a string', function() {

            assert.doesNotThrow(() => {

                sparga.init({
                    gaSettings: FAKE_TRACKING_ID
                })

            })

        })

        it('should throw if trackingId not present when gaSettings is an object literal', function() {

            assert.throws(() => {

                sparga.init({
                    gaSettings: {}
                })

            }, Error)

        })

    })

    describe('sendEvent', function() {

        it('should send correct "event" hit info', function() {

            const testData = {
                eventCategory: 'test-category',
                eventAction: 'test-action',
                eventLabel: 'test-label',
                eventValue: 1,
                hitType: 'event'
            }

            sparga.init(FAKE_TRACKING_ID)

            sparga.sendEvent(
                testData.eventCategory,
                testData.eventAction,
                testData.eventLabel,
                testData.eventValue
            )

            const gaCommand = gaCall.lastCall.args[0]
            const args = gaCall.lastCall.args[1]

            assert.equal(gaCommand, 'send')
            assert.deepEqual(testData, args)

        })

        it('should send correct "event" hit info when a value is passed that cannot be parsed into an integer', function() {

            const testData = {
                eventCategory: 'test-category',
                eventAction: 'test-action',
                eventLabel: 'test-label',
                eventValue: 'this-is-not-a-number',
                hitType: 'event'
            }

            sparga.init(FAKE_TRACKING_ID)

            sparga.sendEvent(
                testData.eventCategory,
                testData.eventAction,
                testData.eventLabel,
                testData.eventValue
            )

            const gaCommand = gaCall.lastCall.args[0]
            const args = gaCall.lastCall.args[1]

            assert.equal(gaCommand, 'send')
            assert.equal(args.eventValue, undefined)

        })

    })

    describe('sendException', function() {

        it('should send correct "exception" hit info', function() {

            const testData = {
                exDescription: 'test-error',
                exFatal: true,
                hitType: 'exception'
            }

            sparga.init(FAKE_TRACKING_ID)

            sparga.sendException(
                testData.exDescription,
                testData.exFatal
            )

            const gaCommand = gaCall.lastCall.args[0]
            const args = gaCall.lastCall.args[1]

            assert.equal(gaCommand, 'send')
            assert.deepEqual(testData, args)


        })

    })

    describe('sendSocial', function() {

        it('should send correct "social" hit info', function() {

            const testData = {
                socialNetwork: 'test-network',
                socialAction: 'test-action',
                socialTarget: 'test-target',
                hitType: 'social'
            }

            sparga.init(FAKE_TRACKING_ID)

            sparga.sendSocial(
                testData.socialNetwork,
                testData.socialAction,
                testData.socialTarget
            )

            const gaCommand = gaCall.lastCall.args[0]
            const args = gaCall.lastCall.args[1]

            assert.equal(gaCommand, 'send')
            assert.deepEqual(testData, args)

        })

    })

    describe('sendTiming', function() {

        const hardDuration = 3000
        const start = new Date('03-31-1988')

        const testData = {
            timingCategory: 'test-category',
            timingVar: 'test-var',
            timingValue: hardDuration,
            timingLabel: 'test-label',
            hitType: 'timing'
        }

        it('should send correct "timing" hit info when duration is passed', function() {

            sparga.init(FAKE_TRACKING_ID)

            sparga.sendTiming(
                testData.timingCategory,
                testData.timingVar,
                testData.timingLabel,
                hardDuration
            )

            const gaCommand = gaCall.lastCall.args[0]
            const args = gaCall.lastCall.args[1]

            assert.equal(gaCommand, 'send')
            assert.deepEqual(testData, args)

        })

        it('should send correct "timing" hit info when start Date object is passed', function() {

            sparga.init(FAKE_TRACKING_ID)

            const closeEnoughStop = new Date()
            const closeEnoughDuration = closeEnoughStop.getTime() - start.getTime()

            sparga.sendTiming(
                testData.timingCategory,
                testData.timingVar,
                testData.timingLabel,
                start
            )

            const gaCommand = gaCall.lastCall.args[0]
            const args = gaCall.lastCall.args[1]

            assert.equal(gaCommand, 'send')
            assert.equal(testData.timingCategory, args.timingCategory)
            assert.equal(testData.timingVar, args.timingVar)
            assert.equal(testData.timingLabel, args.timingLabel)

            // if not within 1/2 a second, consider timing calc in error
            assert.ok((args.timingValue - closeEnoughDuration) < 500)

        })

        it('should send correct "timing" hit info when start Date and stop Date objects are passed', function() {

            const end = new Date()
            const duration = end.getTime() - start.getTime()

            sparga.init(FAKE_TRACKING_ID)

            sparga.sendTiming(
                testData.timingCategory,
                testData.timingVar,
                testData.timingLabel,
                start,
                end
            )

            const gaCommand = gaCall.lastCall.args[0]
            const args = gaCall.lastCall.args[1]

            assert.equal(gaCommand, 'send')
            assert.equal(testData.timingCategory, args.timingCategory)
            assert.equal(testData.timingVar, args.timingVar)
            assert.equal(testData.timingLabel, args.timingLabel)
            assert.equal(duration, args.timingValue)

        })

        it('should should NOT call GA if an invalid start Date or duration was passed', function() {

            sparga.init(FAKE_TRACKING_ID)

            const wasGaCalled = sparga.sendTiming(
                testData.timingCategory,
                testData.timingVar,
                testData.timingLabel,
                'invalid'
            )

            assert.equal(wasGaCalled, false)

        })

    })

    describe('setDimension', function() {

        const testDimensionFriendlyName = 'testDimension'
        const testDimensionGaName = 'dimension14'
        const testDimensionValue = 'this is a test dim value'

        const testDimensionMap = {
            [testDimensionFriendlyName]: testDimensionGaName
        }

        it('should set correct dimension info', function() {

            sparga.init({
                gaSettings: FAKE_TRACKING_ID,
                dimensionMap: testDimensionMap
            })

            sparga.setDimension(testDimensionFriendlyName, testDimensionValue)

            const gaCommand = gaCall.lastCall.args[0]
            const gaDimension = gaCall.lastCall.args[1]
            const gaDimValue = gaCall.lastCall.args[2]

            assert.equal(gaCommand, 'set')
            assert.equal(gaDimension, testDimensionMap[testDimensionFriendlyName])
            assert.equal(gaDimValue, testDimensionValue)

        })

        it('should not call GA if an invalid dimension name was passed', function() {

            sparga.init({
                gaSettings: FAKE_TRACKING_ID,
                dimensionMap: testDimensionMap
            })

            const wasGaCalled = sparga.setDimension('invalid-name', testDimensionValue)
            assert.equal(wasGaCalled, false)

        })

    })

    describe('setMetric', function() {

        const testMetricFriendlyName = 'testMetric'
        const testMetricGaName = 'metric6'
        const testMetricValue = 120

        const testMetricMap = {
            [testMetricFriendlyName]: testMetricGaName
        }

        it('should set correct metric info', function() {

            sparga.init({
                gaSettings: FAKE_TRACKING_ID,
                metricMap: testMetricMap
            })

            sparga.setMetric(testMetricFriendlyName, testMetricValue)

            const gaCommand = gaCall.lastCall.args[0]
            const gaMetric = gaCall.lastCall.args[1]
            const gaMetricValue = gaCall.lastCall.args[2]

            assert.equal(gaCommand, 'set')
            assert.equal(gaMetric, testMetricMap[testMetricFriendlyName])
            assert.equal(gaMetricValue, testMetricValue)

        })

        it('should not call GA if a non-numeric metric value is set', function() {

            sparga.init({
                gaSettings: FAKE_TRACKING_ID,
                metricMap: testMetricMap
            })

            const wasGaCalled = sparga.setMetric(testMetricFriendlyName, 'this-is-not-a-number')
            assert.equal(wasGaCalled, false)

        })

        it('should not call GA if an invalid metric name was passed', function() {

            sparga.init({
                gaSettings: FAKE_TRACKING_ID,
                metricMap: testMetricMap
            })

            const wasGaCalled = sparga.setMetric('invalid-name', testMetricValue)
            assert.equal(wasGaCalled, false)

        })

    })

})