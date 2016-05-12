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
    settings = require('../lib/settings'),
    destinationParser = require('../lib/destinationParser');

suite('BusSpy', function() {
    var stompClient;
    var busSpy;

    setup(function() {
        busSpy = new BusSpy();
    });

    teardown(function () {

    });

    test('#onDestination should be a fluid method (return busSpy)', function() {
        var returned = busSpy.onDestination('/topic/user_eyeos');
        assert.strictEqual(returned, busSpy);
    });

    test('#timeout should be a fluid method (return busSpy)', function() {
        var returned = busSpy.onDestination('/topic/user_eyeos').timeout(3000);
        assert.strictEqual(returned, busSpy);
    });

    suite('#validateTimeout', function() {

        test('#timeout should return true on valid timeout', function() {
            busSpy.onDestination('/topic/user_eyeos').timeout(3000);

            assert.isTrue(busSpy.validateTimeout());
        });

        test('#timeout should return false on invalid timeout', function() {
            var timeouts = ['invalid timeout', null, undefined, new Date()];

            timeouts.forEach(function(timeout){
                busSpy.onDestination('/topic/user_eyeos').timeout(timeout);

                assert.isFalse(busSpy.validateTimeout(), "Expected timeout value to be invalid: "+timeout);
            });
        });

        test('#timeout should return false on timeout <= 0', function() {
            var timeouts = [0, -1, -4000];

            timeouts.forEach(function(timeout){
                busSpy.onDestination('/topic/user_eyeos').timeout(timeout);

                assert.isFalse(busSpy.validateTimeout(), "Expected timeout value to be invalid: "+timeout);
            });
        });
    });
    suite('#done', function() {
        setup(function(){
            sinon.stub(busSpy, '_start').returns();
        });

        teardown(function(){
            busSpy._start.restore();
        });

        test('should NOT be a fluid method (return null)', function () {
            var returned = busSpy.onDestination('/topic/a').done(sinon.spy());

            assert.isNull(returned);
        });

        test('should validate destination', function () {
            var destinationIsValidSpy = sinon.spy(destinationParser, 'destinationIsValid');

            busSpy.onDestination('/topic/a').done();

            sinon.assert.calledOnce(destinationIsValidSpy);

            destinationIsValidSpy.restore();
        });

        test('should throw on invalid destination', function () {
            assert.throw(busSpy.onDestination('invalid destination!').done.bind(busSpy, function() {}), 'is not a valid destination');
        });

        test('should throw on invalid timeout', function () {
            assert.throw(busSpy.onDestination('/topic/aaa').timeout('invalid timeout').done.bind(busSpy, function() {}), 'is not valid');
        });

        test('should not throw error when timeout is not set', function() {
            process.env.BUS_EXPECTATION_TIMEOUT = null;
            assert.doesNotThrow(busSpy.onDestination('/topic/aaa').done.bind(busSpy, function() {}), Error);
        });
    });
});
