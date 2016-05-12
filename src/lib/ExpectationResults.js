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

var util = require('util');

var ExpectationResults = function ExpectationResults() {
    this.results = {};
    this.lastMessage = null;
};

ExpectationResults.prototype.getMessageId = function getMessageId(msg) {
    return msg ? JSON.stringify(msg): null;
};

ExpectationResults.prototype.getLastMessageResults = function getLastMessageResults() {
    return this.getMessageResults(this.lastMessage);
};

ExpectationResults.prototype.getMessageResults = function getMessageResults(msg) {
    var msgId = this.getMessageId(msg);
    return msgId ? this.results[msgId] : null;
};

ExpectationResults.prototype.generateReport = function generateReport() {
    var RESET = '\x1b[0m';
    var YELLOW = '\x1b[33m';

    var unmetExpectations = [];
    //this.results.forEach(function(expectationsResultsForMessage){
    for (var msgId in this.results) {
        var expectationsResultsForMessage = this.results[msgId];
        var message = expectationsResultsForMessage.message;
        var failedExpectationsResultsByMessage = expectationsResultsForMessage.results.filter(function(expectationResultForMessage) {
            return expectationResultForMessage.result === false;
        });
        unmetExpectations.push({
            message: message,
            failedExpectations: failedExpectationsResultsByMessage
        });
    }

    var report = util.inspect(unmetExpectations, {depth: 5, colors: true});
    report = '';
    unmetExpectations.forEach(function(msgAndResults) {
        report += '\n' + RESET + '' + YELLOW + '>>>> Message:' + RESET + '\n' + util.inspect(msgAndResults.message, {depth: 5, colors: true}) + '\n\n' + YELLOW + '--- Failed Expectations:' + RESET;
        msgAndResults.failedExpectations.forEach(function(expectation) {
            report += '\n\texpectationName: '+ expectation.expectation.expectationName + ' expected: ' + util.inspect(expectation.expectation.expected , {depth: 5, colors: true}) + ' result: ' + expectation.result;
        });
        report += '\n' + YELLOW + '<<<<' + RESET;

    });
    return report;
};

ExpectationResults.prototype.addResult = function addResult(msg, expectation, result) {
    var msgId = this.getMessageId(msg);
    var resultsForMessage = this.results[msgId];
    if (resultsForMessage) {
        this.lastMessage = msg;
        resultsForMessage.results.push({expectation: expectation, result: result});
    } else {
        this.results[msgId] = {
            message: msg,
            results: []
        };
        this.addResult(msg, expectation, result);
    }

};

module.exports = ExpectationResults;