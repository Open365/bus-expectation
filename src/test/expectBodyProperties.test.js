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
var BusSpy = require('../lib/BusSpy');
var expectBodyProperties = require('../lib/expectations/expectBodyProperties');

suite('expectBodyProperties', function() {
    var busSpy;
    var types;
    setup(function() {
        busSpy = new BusSpy();
        types = [String, Number, Object, Boolean, busSpy.Defined];
    });

    test('should work as a factory function', function() {
        assert.isFunction(expectBodyProperties({}))
    });

    test('should validate objects that match expected object', function() {
        var expectedObj = {a: 1, b: 'hello world'};
        var validationFunction = expectBodyProperties(expectedObj);

        var message = {
            body: JSON.stringify({a: 1, b: 'hello world', c: 'no assertion on this field'})
        };

        assert.isTrue(validationFunction(message));
    });

    test('should validate objects with deep properties expectations', function() {
        var expectedObj = {a: 1, "client.name": "markus"};
        var validationFunction = expectBodyProperties(expectedObj);

        var message = {
            body: JSON.stringify({a: 1, b: 'hello world', c: 'no assertion on this field', client: {name: "markus"}})
        };

        assert.isTrue(validationFunction(message));
    });

    test('should NOT validate objects NOT containing expected properties', function() {
        var expectedObj = {
            a: 1,
            b: 'hello world',
            c: String,
            d: Object,
            e: Number,
            f: busSpy.Defined
        };
        var validationFunction = expectBodyProperties(expectedObj);

        var message = {
            body: JSON.stringify({a: 1})
        };

        assert.isFalse(validationFunction(message));
    });

    test('should validate when expectation and value are String types', function() {
        var expectedObj = {
            c: String
        };
        var validationFunction = expectBodyProperties(expectedObj);

        var message = {
            body: JSON.stringify({c: 'a string'})
        };

        assert.isTrue(validationFunction(message));
    });

    test('should NOT validate when expectation is String and value is not', function() {
        var expectedObj = {
            c: String
        };
        var validationFunction = expectBodyProperties(expectedObj);

        var message = {
            body: JSON.stringify({c: 3})
        };

        assert.isFalse(validationFunction(message));
    });

    test('should validate when expectation and value are Number types', function() {
        var expectedObj = {
            c: Number
        };
        var validationFunction = expectBodyProperties(expectedObj);

        var message = {
            body: JSON.stringify({c: 55555555})
        };

        assert.isTrue(validationFunction(message));
    });

    test('should NOT validate when expectation is Number and value is not', function() {
        var expectedObj = {
            c: Number
        };
        var validationFunction = expectBodyProperties(expectedObj);

        var message = {
            body: JSON.stringify({c: 'a not number'})
        };

        assert.isFalse(validationFunction(message));
    });

    test('should validate when expectation and value are Object types', function() {
        var expectedObj = {
            c: Object
        };
        var validationFunction = expectBodyProperties(expectedObj);

        var message = {
            body: JSON.stringify({c: {a:1}})
        };

        assert.isTrue(validationFunction(message));
    });

    test('should NOT validate when expectation is Object and value is not', function() {
        var expectedObj = {
            c: Object
        };
        var validationFunction = expectBodyProperties(expectedObj);

        var message = {
            body: JSON.stringify({c: 'not an object'})
        };

        assert.isFalse(validationFunction(message));
    });

    test('should validate when expectation and value are Boolean types', function() {
        var expectedObj = {
            c: Boolean
        };
        var validationFunction = expectBodyProperties(expectedObj);

        var message = {
            body: JSON.stringify({c: false})
        };

        assert.isTrue(validationFunction(message));
    });

    test('should NOT validate when expectation is Object and value is not', function() {
        var expectedObj = {
            c: Boolean
        };
        var validationFunction = expectBodyProperties(expectedObj);

        var message = {
            body: JSON.stringify({c: 'not a boolean'})
        };

        assert.isFalse(validationFunction(message));
    });

    test('should validate when expectation is busSpy.Defined and value is defined', function() {
        var values = [1, 'eeeeee', true, false, new Date(), /.*/, {an: {}}, [1,2]];

        values.forEach(function(value){
            var expectedObj = {
                c: busSpy.Defined
            };
            var validationFunction = expectBodyProperties(expectedObj);

            var message = {
                body: JSON.stringify({c: value})
            };

            assert.isTrue(validationFunction(message));
        });
    });

    test('should NOT validate when expectation is busSpy.Defined and value is not defined', function() {
        var values = [null, NaN]; // undefined is never expected because messages come from JSON.parse

        values.forEach(function(value){
            var expectedObj = {
                c: busSpy.Defined
            };
            var validationFunction = expectBodyProperties(expectedObj);

            var message = {
                body: JSON.stringify({c: value})
            };

            assert.isFalse(validationFunction(message));
        });
    });

    test('should validate when expectation and value are defined as null', function() {
        var expectedObj = {
            c: null
        };
        var validationFunction = expectBodyProperties(expectedObj);

        var message = {
            body: JSON.stringify({c: null})
        };

        assert.isTrue(validationFunction(message));
    });

    test('should NOT validate when expectation is null and value is not', function() {
        var expectedObj = {
            c: null
        };
        var validationFunction = expectBodyProperties(expectedObj);

        var message = {
            body: JSON.stringify({c: 'not null'})
        };

        assert.isFalse(validationFunction(message));
    });

    test('should NOT validate when expectation is of a given type and value is null', function() {
        types.forEach(function(aType) {
            var expectedObj = {
                c: aType
            };
            var validationFunction = expectBodyProperties(expectedObj);

            var message = {
                body: JSON.stringify({c: null})
            };

            assert.isFalse(validationFunction(message));
        });
    });

    test('should validate objects that contain unexpected properties', function() {
        var expectedObj = {a: 1};
        var validationFunction = expectBodyProperties(expectedObj);

        var message = {
            body: JSON.stringify({a: 1, c: 'no assertion on this field'})
        };

        assert.isTrue(validationFunction(message));
    });

    test('should NOT validate empty bodies', function() {
        var expectedObj = {a: 1, b: 'hello world'};
        var validationFunction = expectBodyProperties(expectedObj);

        var message = {body: '{}'};

        assert.isFalse(validationFunction(message));
    });

    test('should NOT validate empty messages', function() {
        var expectedObj = {a: 1, b: 'hello world'};
        var validationFunction = expectBodyProperties(expectedObj);

        var message = {};

        assert.isFalse(validationFunction(message));
    });
});