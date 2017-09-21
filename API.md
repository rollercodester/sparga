![sparga](https://user-images.githubusercontent.com/1450389/30691215-e68697de-9e7b-11e7-8d7c-a7a6e7c4d34c.jpg)

**S**ingle-**P**age **A**pplication **R**elay for **G**oogle **A**nalytics

# API Reference
---

# Functions

<dl>
<dt><a href="#init">init(options)</a></dt>
<dd><p>Initializes a tracker in GA and wires-up automated features of Sparga.</p>
</dd>
<dt><a href="#send">send()</a></dt>
<dd><p>Pass-thru method for the GA send command. For method signature, see <a href="https://developers.google.com/analytics/devguides/collection/analyticsjs/command-queue-reference#send">https://developers.google.com/analytics/devguides/collection/analyticsjs/command-queue-reference#send</a></p>
</dd>
<dt><a href="#sendEvent">sendEvent(category, action, label, value)</a></dt>
<dd><p>Helper method to send a hit of type &quot;event&quot; to GA.</p>
</dd>
<dt><a href="#sendException">sendException(errMessage, wasFatal)</a></dt>
<dd><p>Helper method to send a hit of type &quot;exception&quot; to GA.</p>
</dd>
<dt><a href="#sendSocial">sendSocial(network, action, target)</a></dt>
<dd><p>Helper method to send a hit of type &quot;social&quot; to GA.</p>
</dd>
<dt><a href="#sendTiming">sendTiming(category, variable, label, startOrDuration, [stop])</a></dt>
<dd><p>Helper method to send a hit of type &quot;timing&quot; to GA.</p>
</dd>
<dt><a href="#setDimension">setDimension(name, value)</a></dt>
<dd><p>Helper method to set a custom dimension in GA.</p>
</dd>
<dt><a href="#setMetric">setMetric(name, value)</a></dt>
<dd><p>Helper method to set a custom metric in GA.</p>
</dd>
</dl>

# Typedefs

<dl>
<dt><a href="#GASettings">GASettings</a> : <code>object</code></dt>
<dd><p>Google Analytics settings object that determines values set at creation time for tracker fields. Although all fields are supported, only a subset are specified here, particularly those where Sparga defaults to a different value than Google does. See <a href="https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#create">https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#create</a> for field definitions.</p>
</dd>
<dt><a href="#DimensionMap">DimensionMap</a> : <code>object</code></dt>
<dd><p>Literal object containing key-value pairs of custom GA dimension maps. Each property key is a logical &quot;friendly&quot; dimension name that developers will use in code. Each property value is the actual GA dimension name (e.g. dimension14).</p>
</dd>
<dt><a href="#MetricMap">MetricMap</a> : <code>object</code></dt>
<dd><p>Literal object containing key-value pairs of custom GA metric maps. Each property key is a logical &quot;friendly&quot; metric name that developers will use in code. Each property value is the actual GA metric name (e.g. metric5).</p>
</dd>
<dt><a href="#SpargaOptions">SpargaOptions</a> : <code>object</code></dt>
<dd><p>Options object used when initializing Sparga.</p>
</dd>
</dl>

<a name="init"></a>

# init(options)
Initializes a tracker in GA and wires-up automated features of Sparga.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| options | [<code>SpargaOptions</code>](#SpargaOptions) \| <code>string</code> | Specifies initialization settings for Sparga or your GA tracking ID. |

<a name="send"></a>

# send()
Pass-thru method for the GA send command. For method signature, see https://developers.google.com/analytics/devguides/collection/analyticsjs/command-queue-reference#send

**Kind**: global function  
<a name="sendEvent"></a>

# sendEvent(category, action, label, value)
Helper method to send a hit of type "event" to GA.

**Kind**: global function  

| Param | Type |
| --- | --- |
| category | <code>string</code> | 
| action | <code>string</code> | 
| label | <code>string</code> | 
| value | <code>number</code> | 

<a name="sendException"></a>

# sendException(errMessage, wasFatal)
Helper method to send a hit of type "exception" to GA.

**Kind**: global function  

| Param | Type |
| --- | --- |
| errMessage | <code>string</code> | 
| wasFatal | <code>boolean</code> | 

<a name="sendSocial"></a>

# sendSocial(network, action, target)
Helper method to send a hit of type "social" to GA.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| network | <code>string</code> | The social networking site (e.g. Facebook) |
| action | <code>string</code> | The social action (e.g. like) |
| target | <code>string</code> | The subject of the action (e.g. name of post, URL, etc.) |

<a name="sendTiming"></a>

# sendTiming(category, variable, label, startOrDuration, [stop])
Helper method to send a hit of type "timing" to GA.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| category | <code>string</code> |  |
| variable | <code>string</code> |  |
| label | <code>string</code> |  |
| startOrDuration | <code>date</code> \| <code>number</code> | Either a Date object depicting the start of an operation that is being timed OR an integer depicting the elapsed duration of the respective operation |
| [stop] | <code>date</code> | An optional Date object depicting the end of an operation that is being timed. |

<a name="setDimension"></a>

# setDimension(name, value)
Helper method to set a custom dimension in GA.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Logical "friendly" name of the custom dimension. Refer to @DimensionMap for more information. |
| value | <code>string</code> | The value to set the dimension to for respective tracker session. |

<a name="setMetric"></a>

# setMetric(name, value)
Helper method to set a custom metric in GA.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Logical "friendly" name of the custom metric. Refer to @MetricMap for more information. |
| value | <code>number</code> | The value to set the metric to for respective tracker session. |

<a name="GASettings"></a>

# GASettings : <code>object</code>
Google Analytics settings object that determines values set at creation time for tracker fields. Although all fields are supported, only a subset are specified here, particularly those where Sparga defaults to a different value than Google does. See https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#create for field definitions.

**Kind**: global typedef  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| trackingId | <code>string</code> |  | Your GA tracking ID (e.g. "UA-XXXX-Y...") |
| allowAnchor | <code>boolean</code> | <code>false</code> |  |
| alwaysSendReferrer | <code>boolean</code> | <code>true</code> |  |
| forceSSL | <code>boolean</code> | <code>true</code> |  |
| siteSpeedSampleRate | <code>number</code> | <code>100</code> |  |
| storeGac | <code>boolean</code> | <code>false</code> |  |

<a name="DimensionMap"></a>

# DimensionMap : <code>object</code>
Literal object containing key-value pairs of custom GA dimension maps. Each property key is a logical "friendly" dimension name that developers will use in code. Each property value is the actual GA dimension name (e.g. dimension14).

**Kind**: global typedef  
**Example** *(For example)*  
```js
{
   variantTestName: 'dimension1',
   variantTestSampling: 'dimension2',
   userRole: 'dimension3'
}
```
<a name="MetricMap"></a>

# MetricMap : <code>object</code>
Literal object containing key-value pairs of custom GA metric maps. Each property key is a logical "friendly" metric name that developers will use in code. Each property value is the actual GA metric name (e.g. metric5).

**Kind**: global typedef  
**Example** *(For example)*  
```js
{
   isNewUser: 'metric4',
   isUserAdmin: 'metric15',
   isViewSetAsPersistent: 'metric9'
}
```
<a name="SpargaOptions"></a>

# SpargaOptions : <code>object</code>
Options object used when initializing Sparga.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| autoCaptureClickEvents | <code>boolean</code> | Determines whether or not all mouse click events are automatically captured and sent to GA. |
| gaSettings | [<code>GASettings</code>](#GASettings) \| <code>string</code> | Either an object literal that defines the "GA create" settings OR your GA tracking ID (e.g. "UA-XXXX-Y..."). |
| dimensionMap | [<code>DimensionMap</code>](#DimensionMap) | Defines map of custom GA dimensions that developers can use. |
| metricMap | [<code>MetricMap</code>](#MetricMap) | Defines map of custom GA metrics that developers can use. |







