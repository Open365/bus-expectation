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
var settings = require('./settings');
var Assertion = require('./expectation');

function BusExpectation() {
    this.client = new stomp.Stomp(settings.stomp);
    this.messages = [];
}

BusExpectation.prototype.countMessages = function() {
    return this.messages.length;
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

BusExpectation.prototype.expect = function(obj) {
    this.assertion = new Assertion(obj);
    var self = this;
    this.client.on('message', function(message) {
        self.client.ack(message.headers['message-id']);
        self.messages.push(message);
        self.assertion.expect(message);
    });
    return this;
};

BusExpectation.prototype.verify = function(done) {
    var result = this.assertion.verify();
    if (result) {
        done();
    } else {
        var self = this;
        setTimeout(function() {
            self.verify(done);
        }, 500);
    }
};

BusExpectation.prototype.disconnect = function() {
    this.client.disconnect();
};

BusExpectation.BusSpy = require('./BusSpy');

module.exports = BusExpectation;
