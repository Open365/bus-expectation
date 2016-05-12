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

var ObjectUtil = require('../objectUtil');
var Defined = require('../Defined');

function expectBodyProperties(expectation) {

    var objectUtil = new ObjectUtil();

    return function matchDeepPropertyToMessage(message) {
        var result = false;
        if (message.body) {
            var msgBody = JSON.parse(message.body);

            result = true;
            for (var deepProperty in expectation) {
                var deepValue = objectUtil.keyByString(msgBody, deepProperty);
                var expectedValue = expectation[deepProperty];
                if(expectedValue === null) {
                    if (deepValue === null ) {
                        continue;
                    } else {
                        result = false;
                        break;
                    }
                }

                if(expectedValue.constructor === Function){
                    if(deepValue === null){
                        result = false;
                        break;
                    }
                    if(expectedValue !== Defined && deepValue.constructor !== expectedValue) {
                        result = false;
                        break;
                    }
                } else if (expectedValue === null && deepValue !== null) {
                    result = false;
                    break;
                } else if (expectedValue.constructor !== Function && deepValue !== expectedValue) {
                    result = false;
                    break;
                }
            }
        }
        return result;
    }
}

module.exports = expectBodyProperties;
