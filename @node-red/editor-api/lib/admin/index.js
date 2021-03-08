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

var express = require("express");

var instances = {};

module.exports = function(instance_id) {
   if (instances[instance_id]) {
       return instances[instance_id];
   }

var nodes = require("./nodes")(instance_id);
var flows = require("./flows")(instance_id);
var flow = require("./flow")(instance_id);
var context = require("./context")(instance_id);
var auth = require("../auth")(instance_id);
var info = require("./settings")(instance_id);

var apiUtil = require("../util")(instance_id);

var result = {
    init: function(settings,runtimeAPI) {
        flows.init(runtimeAPI);
        flow.init(runtimeAPI);
        nodes.init(runtimeAPI);
        context.init(runtimeAPI);
        info.init(settings,runtimeAPI);

        var needsPermission = auth.needsPermission;

        var adminApp = express();

        // Flows
        adminApp.get("/flows",needsPermission("flows.read"),flows.get,apiUtil.errorHandler);
        adminApp.post("/flows",needsPermission("flows.write"),flows.post,apiUtil.errorHandler);

        // Flow
        adminApp.get("/flow/:id",needsPermission("flows.read"),flow.get,apiUtil.errorHandler);
        adminApp.post("/flow",needsPermission("flows.write"),flow.post,apiUtil.errorHandler);
        adminApp.delete("/flow/:id",needsPermission("flows.write"),flow.delete,apiUtil.errorHandler);
        adminApp.put("/flow/:id",needsPermission("flows.write"),flow.put,apiUtil.errorHandler);

        // Nodes
        adminApp.get("/nodes",needsPermission("nodes.read"),nodes.getAll,apiUtil.errorHandler);

        if (!settings.editorTheme || !settings.editorTheme.palette || settings.editorTheme.palette.upload !== false) {
            const multer  = require('multer');
            const upload = multer({ storage: multer.memoryStorage() });
            adminApp.post("/nodes",needsPermission("nodes.write"),upload.single("tarball"),nodes.post,apiUtil.errorHandler);
        } else {
            adminApp.post("/nodes",needsPermission("nodes.write"),nodes.post,apiUtil.errorHandler);
        }
        adminApp.get(/^\/nodes\/messages/,needsPermission("nodes.read"),nodes.getModuleCatalogs,apiUtil.errorHandler);
        adminApp.get(/^\/nodes\/((@[^\/]+\/)?[^\/]+\/[^\/]+)\/messages/,needsPermission("nodes.read"),nodes.getModuleCatalog,apiUtil.errorHandler);
        adminApp.get(/^\/nodes\/((@[^\/]+\/)?[^\/]+)$/,needsPermission("nodes.read"),nodes.getModule,apiUtil.errorHandler);
        adminApp.put(/^\/nodes\/((@[^\/]+\/)?[^\/]+)$/,needsPermission("nodes.write"),nodes.putModule,apiUtil.errorHandler);
        adminApp.delete(/^\/nodes\/((@[^\/]+\/)?[^\/]+)$/,needsPermission("nodes.write"),nodes.delete,apiUtil.errorHandler);
        adminApp.get(/^\/nodes\/((@[^\/]+\/)?[^\/]+)\/([^\/]+)$/,needsPermission("nodes.read"),nodes.getSet,apiUtil.errorHandler);
        adminApp.put(/^\/nodes\/((@[^\/]+\/)?[^\/]+)\/([^\/]+)$/,needsPermission("nodes.write"),nodes.putSet,apiUtil.errorHandler);

        // Context
        adminApp.get("/context/:scope(global)",needsPermission("context.read"),context.get,apiUtil.errorHandler);
        adminApp.get("/context/:scope(global)/*",needsPermission("context.read"),context.get,apiUtil.errorHandler);
        adminApp.get("/context/:scope(node|flow)/:id",needsPermission("context.read"),context.get,apiUtil.errorHandler);
        adminApp.get("/context/:scope(node|flow)/:id/*",needsPermission("context.read"),context.get,apiUtil.errorHandler);

        // adminApp.delete("/context/:scope(global)",needsPermission("context.write"),context.delete,apiUtil.errorHandler);
        adminApp.delete("/context/:scope(global)/*",needsPermission("context.write"),context.delete,apiUtil.errorHandler);
        // adminApp.delete("/context/:scope(node|flow)/:id",needsPermission("context.write"),context.delete,apiUtil.errorHandler);
        adminApp.delete("/context/:scope(node|flow)/:id/*",needsPermission("context.write"),context.delete,apiUtil.errorHandler);

        adminApp.get("/settings",needsPermission("settings.read"),info.runtimeSettings,apiUtil.errorHandler);

        return adminApp;
    }
};

instances[instance_id] = result;
return result;

};
