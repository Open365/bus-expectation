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

;'use strict';

var sinon = require('sinon'),
    assert = require('chai').assert;
var destinationParser = require('../lib/destinationParser');

suite('destinationParser', function() {

    setup(function() {
    });

    suite('#isTopic', function() {

        test('should return true for valid topics', function () {
            var topics = [
                '/topic/user_eyeos',
                '/topic/u_ser.eye-os',
                '/topic/2222',
                '/topic/u'
            ];

            topics.forEach(function(destination){
                var destinationIsTopic = destinationParser.isTopic(destination);
                assert.isTrue(destinationIsTopic, "Destionation expected to be a correct topic: "+destination);
            });
        });

        test('should return false for invalid topics', function () {
            var topics = [
                '/topic/user eyeos',
                '/topic/u_ser/eye-os',
                '/topic/2222=',
                '/topic/u;',
                '/queue/user_eyeos',
                '/exchange/user_eyeos/my-routing.key'
            ];

            topics.forEach(function(destination){
                var destinationIsTopic = destinationParser.isTopic(destination);
                assert.isFalse(destinationIsTopic, "Destionation expected NOT to be a correct topic: "+destination);
            });
        });
    });


    suite('#isQueue', function() {

        test('should return true for valid queues', function () {
            var queues = [
                '/queue/user_eyeos',
                '/queue/u_ser.eye-os',
                '/queue/2222',
                '/queue/u'
            ];

            queues.forEach(function(destination){
                var destinationIsQueue = destinationParser.isQueue(destination);
                assert.isTrue(destinationIsQueue, "Destionation expected to be a correct queue: "+destination);
            });
        });

        test('should return false for invalid queues', function () {
            var queues = [
                '/queue/user eyeos',
                '/queue/u_ser/eye-os',
                '/queue/2222=',
                '/queue/u;',
                '/exchange/user_eyeos/my-routing.key'
            ];

            queues.forEach(function(destination){
                var destinationIsQueue = destinationParser.isQueue(destination);
                assert.isFalse(destinationIsQueue, "Destionation expected NOT to be a correct queue: "+destination);
            });
        });
    });

    suite('#isExchange', function() {

        test('should return true for valid exchanges with routing key', function () {
            var topics = [
                '/exchange/user_eyeos/user_eyeos',
                '/exchange/user_eyeos/#'
            ];

            topics.forEach(function(destination){
                var destinationIsTopic = destinationParser.isExchange(destination);
                assert.isTrue(destinationIsTopic, "Destionation expected to be a correct topic: "+destination);
            });
        });

        test('should return false for invalid exchanges', function () {
            var topics = [
                '/topic/user eyeos',
                '/exchange/user_eyeos/user eyeos',
                '/exchange/user_eyeos/',
                '/exchange/user_eyeos',
                '/exchange/2222='
            ];

            topics.forEach(function(destination){
                var destinationIsTopic = destinationParser.isExchange(destination);
                assert.isFalse(destinationIsTopic, "Destionation expected NOT to be a correct topic: "+destination);
            });
        });
    });

});
