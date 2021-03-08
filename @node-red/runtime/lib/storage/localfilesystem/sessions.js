/**
 * Copyright JS Foundation and other contributors, http://js.foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

var when = require('when');
var fs = require('fs-extra');
var fspath = require("path");

var instances = {};

module.exports = function(instance_id) {
    if (instances[instance_id]) {
        return instances[instance_id];
    }

var log = require("@node-red/util")(instance_id).log; // TODO: separate module

var util = require("./util")(instance_id);

var sessionsFile;
var settings;

var result = {
    init: function(_settings) {
        settings = _settings;
        sessionsFile = fspath.join(settings.userDir,".sessions.json");
    },
    getSessions: function() {
        return when.promise(function(resolve,reject) {
            fs.readFile(sessionsFile,'utf8',function(err,data){
                if (!err) {
                    try {
                        return resolve(util.parseJSON(data));
                    } catch(err2) {
                        log.trace("Corrupted sessions file - resetting");
                    }
                }
                resolve({});
            })
        });
    },
    saveSessions: function(sessions) {
        if (settings.readOnly) {
            return when.resolve();
        }
        return util.writeFile(sessionsFile,JSON.stringify(sessions));
    }
};

instances[instance_id] = result;
return result;

};
