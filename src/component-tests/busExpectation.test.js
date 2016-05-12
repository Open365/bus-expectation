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

var sinon = require('sinon'),
    assert = require('chai').assert;
var BusExpectation = require('../lib/busExpectation.js'),
    stomp = require('eyeos-stomp'),
    settings = require('../lib/settings');

suite('BusExpectation', function() {
    var sut, client;

    setup(function() {
        client = new stomp.Stomp(settings.stomp);
        sut = new BusExpectation();
    });

    function sleep(ms) {
        var startTime = new Date().getTime();
        while (new Date().getTime() < startTime + ms);
    }

    test('should pass test with message expected', function(done) {
        sut.in('/topic/user_eyeos').expect({
            'type':'test'
        });
        client.connect();
        client.on('connected', function() {
            sleep(100);
            client.send({
                destination: '/topic/user_eyeos',
                body: '{"type":"test"}'
            });
            sut.verify(done);
        });
    });
});
