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

var stomp = require('eyeos-stomp');
var assert = require('chai').assert;

var settings = {
    stomp: {
        port: 61613,
        host: 'localhost',
        debug: false,
        login: 'guest',
        passcode: 'guest'
    }
};

function BusExpectation() {
    this.client = new stomp.Stomp(settings.stomp);
    this.messages = [];
    this.asserts = [];
};

BusExpectation.prototype.in = function(path) {
    var headers = {
        destination: path,
        ack: 'client'
    };
    var self = this;

    this.client.connect();

    this.client.on('connected', function() {
        self.client.subscribe(headers);
        console.log('Connected');
    });

    this.client.on('error', function(error_frame) {
        console.error(error_frame.body);
        self.client.disconnect();
    });

    this.client.on('disconnected', function(error_frame) {
        console.error(error_frame.body);
    });

    return this;
};

BusExpectation.prototype.countMessages = function() {
    return this.messages.length;
};

BusExpectation.prototype.verifyNumberMessages= function(num) {
    assert.equal(this.countMessages(), num, 'Expected one message, arrived: ' + this.countMessages());
};

BusExpectation.prototype.expect = function(obj) {
    this.assertionObject = obj;
    var self = this;
    this.client.on('message', function(message) {
        self.client.ack(message.headers['message-id']);
        self.messages.push(message);
        for (var key in self.assertionObject) {
            if (message.body) {
                var body = JSON.parse(message.body);
                var actualValue = self._byString(body, key);
                if (!self.asserts[key] && actualValue === self.assertionObject[key]) {
                    self.asserts[key] = true;
                }
            }
        }
    });
    return this;
};

BusExpectation.prototype.verify = function(done) {
    var array = [];
    for (var key in this.assertionObject) {
        array.push(this.asserts[key]);
    }
    // if there is any undefined in array, means that some expectation doesn't match
    var result = array.indexOf(undefined) === -1;
    if (result) {
        done();
    } else {
        var self = this;
        setTimeout(function() {
            self.verify(done);
        }, 500);
    }
};

BusExpectation.prototype._byString = function(message, key) {
    key = key.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    key = key.replace(/^\./, '');           // strip a leading dot
    key = key.replace(/\.$/, '');           // strip a finishing dot
    var a = key.split('.');
    for (var i = 0, n = a.length; i < n; ++i) {
        var k = a[i];
        if (message.hasOwnProperty(k)) {
            message = message[k];
        } else {
            return false;
        }
    }
    return message;
};

module.exports = BusExpectation;
