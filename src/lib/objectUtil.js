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

function ObjectUtil() {

}

ObjectUtil.prototype.keyByString = function(message, key) {
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

module.exports = ObjectUtil;
