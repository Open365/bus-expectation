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

var destinationParser = (function(){

    function _matchTopic (destination) {
        return destination.match(/\/topic\/([\w.\-_]*)$/);
    }

    function isTopic (destination) {
        return Boolean(_matchTopic(destination));
    }

    function getTopic (destination) {
        var matchTopic = _matchTopic(destination);
        return ( matchTopic ? matchTopic[1] : null );
    }

    function _matchQueue (destination) {
        return destination.match(/\/queue\/([\w.\-_@]*)$/);
    }

    function isQueue (destination) {
        return Boolean(_matchQueue(destination));
    }

    function getQueue (destination) {
        var matchQueue = _matchQueue(destination);
        return ( matchQueue ? matchQueue[1] : null );
    }

    function _matchExchange (destination) {
        return destination.match(/\/exchange\/([\w.\-_\/@]+)\/([\w.\-_\/#@]+)$/);
    }

    function isExchange (destination) {
        return Boolean(_matchExchange(destination));
    }

    function destinationIsValid (destination) {
        return isTopic(destination) || isQueue(destination) || isExchange(destination);
    }

    return {
        isTopic: isTopic,
        isExchange: isExchange,
        isQueue: isQueue,
        getTopic: getTopic,
        destinationIsValid: destinationIsValid
    }
})();

module.exports = destinationParser;
