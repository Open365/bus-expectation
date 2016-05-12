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

var assert = require('chai').assert;
var Expectation = require('../lib/expectation');

suite('Expectation', function() {
    var sut, obj, message;

    setup(function() {
        obj = {
            'type':'test',
            'type2':'test2'
        };
        message = {
            destination: 'dome destination',
            body: '{"type":"test","type2":"test2"}'
        };
        sut = new Expectation(obj);
    });

    suite('#assert', function() {
        test('should populate asserts array if message is correct', function() {
            sut.expect(message);
            assert.equal(sut.asserts['type'], true, "assert is not tue");
        });

        test('should populate asserts array if message is correct', function() {
            sut.expect({
                'type':'fail'
            });
            assert.equal(sut.asserts['type'], undefined, 'assert is true');
        });
    });

    suite('#verify', function() {
        test('should return true if message is correct', function() {
            sut.expect(message);
            var actual = sut.verify();
            assert.equal(actual, true, 'Expected true, returned false');
        });

        test('should return false if message is incorrect', function() {
            message.body = '{"type":"test"}';
            sut.expect(message);
            var actual = sut.verify();
            assert.equal(actual, false, 'Expected false, returned true');
        });
    });
});
