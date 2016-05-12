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

'use strict';
var settings = require('../settings');
var stomp = require('eyeos-stomp');
// TODO: TEST
var TimedStompClient = function TimedStompClient(destination, timeout) {
    this.destination = destination;
    this.timeout = timeout;
    this.timedOut = false;
};

TimedStompClient.prototype.disconnect = function disconnect() {
    clearInterval(this.timeoutObject);
    this.client.disconnect();
};

TimedStompClient.prototype.start = function start(onStartedCb, onMessageCb) {
    var self = this;

    self.client.on('message', function(message) {
        return onMessageCb(null, message);
    });

    function subscribedCallback() {
        onStartedCb();
    }
    //subscribe once to receipt to get confirmation of subscribe.
    self.client.once('receipt', subscribedCallback);
    self.client.subscribe({destination: self.destination}, null, true); //subscribe with receipt

    self.timeoutObject = setTimeout(function(){
        self.client.disconnect();
        self.timedOut = true;
        return onMessageCb(new Error("TimedStompClient timed out without being disconnected."));
    }, self.timeout);
};

TimedStompClient.prototype.connect = function connect(onConnectedCb) {
    var self = this;
    this.client = new stomp.Stomp(settings.stomp);
    this.client.connect();

    this.client.on('connected', function(error) {
        if (error) {
            console.error('-> Error trying to connect', error);
            return onConnectedCb(error);
        }
        onConnectedCb();
    });

    this.client.on('error', function(error_frame) {
        console.error('-> Error ', error_frame.body);
        self.client.disconnect();
        return onConnectedCb(error_frame);
    });
};

module.exports = TimedStompClient;
