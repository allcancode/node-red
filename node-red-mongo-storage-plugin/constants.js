var instances = {};

module.exports = function(instance_id) {
   if (instances[instance_id]) {
       return instances[instance_id];
   }

var result = {
    DefaultCollectionNames: {
        flows: "nodered-flows",
        sessions: "nodered-sessions",
        credentials: "nodered-credentials",
        settings: "nodered-settings",
        sessions: "nodered-sessions"
    }   
};

instances[instance_id] = result;
return result;

};