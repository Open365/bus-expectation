Bus-expectation Library
=======================

## Overview

Testing library to expect some messages in a queue or topic in stomp protocol.

Currently, there are two API flavours:

* BusExpectation
* BusSpy

### BusSpy

```javascript
var doSendTestMsg;
var busSpy = new BusSpy();
BusSpy().onDestination('/topic/user_eyeos')
    .timeout(1500)
    .exercise(doSendTestMsg) //do whatever actions will cause expected message
    .expectHeadersMatch({'chucha':'jija'}) //expecting the stomp message to have header chucha === 'jija'
    .expectBodyProperties({
        'nested.a': 1, // expecting message to have {... nested: {a: 1} ...}
        "type": String, // expecting type field to be a String
        "nested": Object,
        "aTxt": busSpy.Defined, //expecting aTxt not to be undefined or null
        "aNull": null //expecting aNull field to be null
    })
    .expectPredicate(function(msg){ //expect with custom function
        var body = JSON.parse(msg.body);
        return body.aNumber + body.anotherNumber === 7;
    })
    .done(done);
    
doSendTestMsg = function (exerciseDone) {
    //exercise functions receive a callback to let know the BusSpy when exercise has finished.
    var client = new stomp.Stomp(settings.stomp);
    client.connect();
    client.on('connected', function() {
        client.send({
            chucha: 'jija',
            destination: '/topic/user_eyeos',
            body: '{"type":"test", "aNumber": 3, "anotherNumber": 4, "aTxt": "hi", "ts": 123456789, "nested": {"a": 1, "b": "a be"}, "aNull": null}'
        }, true);
        exerciseDone();
    });
};
```
See *src/component-tests/busSpy.component.test.js* for a complete list of examples.

### BusExpectation

```javascript
var busExpectation = new BusExpectation();
busExpectation.in('/topic/user_eyeos')
	.expect({
		'type': 'jobs.updated',
		'data.body.action': 'move'
	});
busExpectation.verify(done);
```

See usage in src/component-tests/busExpectation.test.js

### Optionally you can pass connection settings through environtment variables:
```bash
export BUS_EXPECTATION_PORT=61613
export BUS_EXPECTATION_HOST=localhost
export BUS_EXPECTATION_DEBUG=false
export BUS_EXPECTATION_USER=<username>
export BUS_EXPECTATION_PASSWORD=<password>
```

## How to use it

## Quick help

* Install modules

```bash
	$ npm install
```

* Check tests

```bash
    $ ./tests.sh
```
