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


 /**
  * This module provides the node registry for the Node-RED runtime.
  *
  * It is responsible for loading node modules and making them available
  * to the runtime.
  *
  * @namespace @node-red/registry
  */

 var instances = {};

 module.exports = function(instance_id) {
    if (instances[instance_id]) {
        return instances[instance_id];
    }

var registry = require("./registry")(instance_id);
var loader = require("./loader")(instance_id);
var installer = require("./installer")(instance_id);
var library = require("./library")(instance_id);

var settings;

function init(runtime) {
    settings = runtime.settings;
    installer.init(runtime);
    loader.init(runtime);
    registry.init(settings,loader,runtime.events);
    library.init();
}

function load() {
    registry.load();
    return installer.checkPrereq().then(loader.load);
}

function addModule(module) {
    return loader.addModule(module).then(function() {
        return registry.getModuleInfo(module);
    });
}

function enableNodeSet(typeOrId) {
    return registry.enableNodeSet(typeOrId).then(function() {
        var nodeSet = registry.getNodeInfo(typeOrId);
        if (!nodeSet.loaded) {
            return loader.loadNodeSet(registry.getFullNodeInfo(typeOrId)).then(function() {
                return registry.getNodeInfo(typeOrId);
            });
        }
        return Promise.resolve(nodeSet);
    });
}

var result = {
    init:init,
    load:load,
    clear: registry.clear,
    registerType: registry.registerNodeConstructor,

    get: registry.getNodeConstructor,
    getNodeInfo: registry.getNodeInfo,
    getNodeList: registry.getNodeList,

    getModuleInfo: registry.getModuleInfo,
    getModuleList: registry.getModuleList,

    getNodeConfigs: registry.getAllNodeConfigs,
    getNodeConfig: registry.getNodeConfig,
    getNodeIconPath: registry.getNodeIconPath,
    getNodeIcons: registry.getNodeIcons,

    enableNode: enableNodeSet,
    disableNode: registry.disableNodeSet,

    addModule: addModule,
    removeModule: registry.removeModule,

    installModule: installer.installModule,
    uninstallModule: installer.uninstallModule,

    cleanModuleList: registry.cleanModuleList,

    paletteEditorEnabled: installer.paletteEditorEnabled,

    getNodeExampleFlows: library.getExampleFlows,
    getNodeExampleFlowPath: library.getExampleFlowPath,

    deprecated: require("./deprecated")(instance_id)

};

instances[instance_id] = result;
return result;

};
