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

var assert = require('chai').assert;
var expectHeadersMatch = require('../lib/expectations/expectHeadersMatch');

suite('expectHeadersMatch', function() {

    setup(function() {
    });

    test('should work as a factory function', function() {
        assert.isFunction(expectHeadersMatch({}))
    });

    test('should validate messages containing expected properties', function() {
        var expectedHeaders = {'header1': 'value1', 'header2': 'value2'};
        var validationFunction = expectHeadersMatch(expectedHeaders);

        var message = {
            headers: {'header1': 'value1', 'header2': 'value2', destination: '/topic/user_markus', 'X-eyeos-TID': '123blahblah'},
            body: JSON.stringify({a: 1, b: 'hello world', c: 'no assertion on this field', client: {name: "markus"}})
        };

        assert.isTrue(validationFunction(message));
    });

});