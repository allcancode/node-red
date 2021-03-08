/*!
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

var instances = {};

module.exports = function(instance_id) {
    if (instances[instance_id]) {
        return instances[instance_id];
    }

var runtime;

var api = {
    init: function(_runtime) {
        runtime = _runtime;
        api.comms.init(runtime);
        api.flows.init(runtime);
        api.nodes.init(runtime);
        api.settings.init(runtime);
        api.library.init(runtime);
        api.projects.init(runtime);
        api.context.init(runtime);
    },

    comms: require("./comms")(instance_id),
    flows: require("./flows")(instance_id),
    library: require("./library")(instance_id),
    nodes: require("./nodes")(instance_id),
    settings: require("./settings")(instance_id),
    projects: require("./projects")(instance_id),
    context: require("./context")(instance_id),

    isStarted: function(opts) {
        return Promise.resolve(runtime.isStarted());
    },
    version: function(opts) {
        return Promise.resolve(runtime.version());
    }
};

instances[instance_id] = api;
return api;

};
