/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

var sinon = require('sinon'),
    assert = require('chai').assert;
var BusSpy = require('../lib/BusSpy.js'),
    stomp = require('eyeos-stomp'),
    settings = require('../lib/settings');

suite('BusSpy', function() {
    this.timeout(10000);

    setup(function() {
    });

    function doSendToDestination(destination, exerciseDone) {
        var client = new stomp.Stomp(settings.stomp);
        client.connect();
        client.on('connected', function() {
            client.send({
                chucha: 'jija',
                destination: destination,
                body: '{"type":"test", "aNumber": 3, "anotherNumber": 4, "aTxt": "hi", "ts": 123456789, "nested": {"a": 1, "b": "a be"}, "aNull": null}'
            }, true);
            exerciseDone();
        });
    }

    var doSendTestMsg = doSendToDestination.bind(null, '/topic/user_eyeos');

    test('should pass test with message expected for a simple property', function(done) {
        BusSpy().onDestination('/topic/user_eyeos')
            .timeout(1500)
            .expectBodyProperties({'type':'test'})
            .exercise(doSendTestMsg)
            .done(done);
    });

    test('should allow to set expectation on deep property value', function(done) {
        BusSpy().onDestination('/topic/user_eyeos')
            .timeout(1500)
            .exercise(doSendTestMsg)
            .expectBodyProperties({
                'nested.a': 1,
                "nested.b": "a be",
                "type": "test"
            })
            .done(done);
    });

    test('should pass test with message sent to queue', function(done) {
        var existingQueue = '/queue/zzz-jarias';
        var sendToQueue = doSendToDestination.bind(null, existingQueue);

        BusSpy().onDestination(existingQueue)
            .timeout(1500)
            .expectBodyProperties({"aTxt": "hi"})
            .exercise(sendToQueue)
            .done(done);
    });

    test('should allow to set more than one expectation', function(done) {
        BusSpy().onDestination('/topic/user_eyeos')
            .timeout(1500)
            .expectBodyProperties({'type':'test', aNumber: 3})
            .expectBodyProperties({"aTxt": "hi"})
            .exercise(doSendTestMsg)
            .done(done);
    });

    test('should allow to set expectation on headers', function(done) {
        BusSpy().onDestination('/topic/user_eyeos')
            .timeout(1500)
            .expectHeadersMatch({'chucha':'jija'})
            .expectBodyProperties({"aTxt": "hi"})
            .exercise(doSendTestMsg)
            .done(done);
    });

    test('should allow to set expectation on custom functions', function(done) {
        BusSpy().onDestination('/topic/user_eyeos')
            .timeout(1500)
            .exercise(doSendTestMsg)
            .expectPredicate(function(msg){
                var body = JSON.parse(msg.body);
                return body.aNumber + body.anotherNumber === 7;
            })
            .done(done);
    });

    test('should allow to set expectation on deep equality of objects', function(done) {
        BusSpy().onDestination('/topic/user_eyeos')
            .timeout(1500)
            .exercise(doSendTestMsg)
            .expectDeepEqual({
                "type": "test",
                "aNumber": 3,
                "anotherNumber": 4,
                "aTxt": "hi",
                "ts": 123456789,
                "nested": {
                    "a": 1,
                    "b": "a be"
                },
                "aNull": null
            })
            .done(done);
    });

    test('should README.md code sample pass :-)', function(done) {
        BusSpy().onDestination('/topic/user_eyeos')
            .timeout(1500)
            .exercise(doSendTestMsg)
            .expectDeepEqual({
                "type": "test",
                "aNumber": 3,
                "anotherNumber": 4,
                "aTxt": "hi",
                "ts": 123456789,
                "nested": {
                    "a": 1,
                    "b": "a be"
                },
                "aNull": null
            })
            .expectPredicate(function(msg){
                var body = JSON.parse(msg.body);
                return body.aNumber + body.anotherNumber === 7;
            })
            .done(done);
    });

    test('should allow to set expectation on types', function(done) {
        BusSpy().onDestination('/topic/user_eyeos')
            .timeout(1500)
            .exercise(doSendTestMsg)
            .expectBodyProperties({
                "aNumber": Number,
                "type": String,
                "nested.a": Number,
                "nested": Object,
                "aTxt": BusSpy().Defined,
                "aNull": null
            })
            .done(done);
    });

    test('should call done callback with error when timed out', function(done) {
        function myDone(err) {
            assert.isDefined(err);
            done();
        }
        BusSpy().onDestination('/topic/user_eyeos')
            .timeout(1)
            .expectBodyProperties({'type':'test', aNumber: 3})
            .expectBodyProperties({"aTxt": "hi"})
            .exercise(doSendTestMsg)
            .done(myDone);
    });
});
