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

var Expectation = require('./expectation');
var ExpectationResults = require('./ExpectationResults');
var settings = require('./settings');

var BusSpy = function BusSpy(injDestinationParser) {
    if( !(this instanceof BusSpy)) {
        return new BusSpy(injDestinationParser)
    }
    this.destination = null;
    this.timeoutValue = settings.timeoutValue || 1000;
    this.destinationParser = injDestinationParser || require('./destinationParser');
    this.expectations = [];
    this.expectionsResults = new ExpectationResults(); // {message: msg, results: [{expectation: expect, result: true}, ...]}
    this.exerciseFunctions = [];
    this.exercising = false;
    this.expectedMatchesNr = 1;
    this.numberMatches = 0;
    this.spyUntilTimeout = false;
};

BusSpy.prototype.reportError = function reportError(err) {
    throw new Error(err);
};

BusSpy.prototype.onDestination = function on(destination) {
    this.destination = destination;
    return this;
};

BusSpy.prototype.timeout = function timeout(timeout) {
    this.timeoutValue = settings.timeoutValue || timeout;
    return this;
};

BusSpy.prototype.expectMatches = function expectMatches(expectedMatchesNr) {
    if (expectedMatchesNr <= 0) {
        throw new Error('Invalid value for expected matches. It should be greater than 0 value is ('+expectedMatchesNr+')');
    }

    this.spyUntilTimeout = false;
    this.expectedMatchesNr = expectedMatchesNr;
    return this;
};

BusSpy.prototype.expectMatchesOnTimeout = function expectMatchesOnTimeout(expectedMatchesNr) {
    this.spyUntilTimeout = true;
    this.expectedMatchesNr = expectedMatchesNr;

    return this;
};

BusSpy.prototype.validateTimeout = function validateTimeout() {
    var timeout = this.timeoutValue;
    return typeof timeout === 'number' && timeout > 0;
};

BusSpy.prototype.validateDestination = function validateDestination() {
    var destination = this.destination;
    return destination && this.destinationParser.destinationIsValid(destination);
};

BusSpy.prototype.exercise = function exercise(func) {
    this.exerciseFunctions.push(func);
    return this;
};

BusSpy.prototype._assertOnMessage = function _assertOnMessage(msg) {
    var self = this;
    this.expectations.forEach(function(expectation){
        var result = expectation.expectation(msg);
        self.expectionsResults.addResult(msg, expectation, result);
    });

    if (this._lastMessageExpectationsAccomplished()) {
        this.numberMatches += 1;
    }
};

BusSpy.prototype._lastMessageExpectationsAccomplished = function _lastMessageExpectationsAccomplished() {
    //checking if last message expectationsResults are all accomplished (results.result === true).
    var lastMsgExpectation = this.expectionsResults.getLastMessageResults();
    var lastMsgExpectationResults = lastMsgExpectation ? lastMsgExpectation.results : null;
    if (lastMsgExpectationResults) {
        return lastMsgExpectationResults.every(function(msgExpectationResult){
            return msgExpectationResult.result === true;
        });
    } else {
        return false;
    }
};

BusSpy.prototype._areExpectationsAccomplished = function _areExpectationsAccomplished() {
    return this.numberMatches === this.expectedMatchesNr;
};

BusSpy.prototype._doneCallbackOnce = function _doneCallbackOnce(error) {
    if (this.calledDone) {
        return;
    }

    this.calledDone = true;
    var messages = [];
    for (var key in this.expectionsResults.results) {
        var message = JSON.parse(key);
        messages.push(JSON.parse(message.body));
    }
    return this.doneCallback(error, messages);
};

BusSpy.prototype._processMessage = function _processMessage(msg) {
    this._assertOnMessage(msg);

    if (!this.spyUntilTimeout && this._areExpectationsAccomplished(msg)) {
        this.client.disconnect();
        this._doneCallbackOnce();
    }
};

BusSpy.prototype._handleTimeout = function _handleTimeout() {
    if (this.spyUntilTimeout && this._areExpectationsAccomplished()) {
        this.client.disconnect();
        this._doneCallbackOnce();
    }

    var report = this.expectionsResults.generateReport();

    if (this.exercising) { //spy timed out with a exerciseFunction still executing. probably exerciseDone callback was not called.
        return this._doneCallbackOnce(new Error('Timed out after: '+ this.timeoutValue+'ms. exercise still executing. probably exerciseDone callback was not called, or takes too long. \n' + report));

    }

    return this._doneCallbackOnce(new Error('Timed out after: '+ this.timeoutValue+'ms. Expectations where not met. \n' + report));
};

BusSpy.prototype._start = function _start() {
    var self = this;

    function onStartedCb(){
        function exerciseDone(exerciseError){
            if(exerciseError) {
                throw exerciseError;
            }
            i += 1;
            if (i < self.exerciseFunctions.length ) {
                return executeExercise(i);
            } else {
                self.exercising = false;
                return;
            }
        }

        function executeExercise(index) {
            self.exercising = true;
            var exerciseFunction = self.exerciseFunctions[index];
            exerciseFunction(exerciseDone);
        }

        var i = 0;
        executeExercise(i);
    }

    function onMessageCb(error, msg) {
        if (error) {
            if (self.client.timedOut) {
                return self._handleTimeout();
            } else {
                return done(error);
            }
        }
        self._processMessage(msg);
    }

    //TODO: revisit this code. decouple client implementation using some dynamic factory cosa. Remove christmas trees
    var TimedStompClient = require('./timedMessageClients/TimedStompClient');
    this.client = new TimedStompClient(this.destination, this.timeoutValue);

    this.client.connect(function(error, msg) {
        if (error) {
            throw error;
        }
        self.client.start(onStartedCb, onMessageCb);
    });
};

BusSpy.prototype.done = function done(doneCallback) {
    this.doneCallback = doneCallback;

    if( !this.validateDestination() ) {
        return this.reportError('Destination: '+this.destination+' is not a valid destination.');
    }

    if( !this.validateTimeout() ) {
        return this.reportError('Timeout: '+this.timeoutValue+' is not valid');
    }

    this._start();

    return null;
};

/*
 * Add all plugins under ./expectations as BusSpy DSL methods
 * plugins are expected to be functionFactories
 */
var path = require('path');
var addExpectationMethodsTo = require('./addExpectationMethodsTo');
var expectationsPath = path.join(__dirname, 'expectations');
addExpectationMethodsTo(BusSpy, expectationsPath);

var Defined = require('./Defined');
BusSpy.prototype.Defined = Defined;

module.exports = BusSpy;
