var dbName = 'super-demo';
var data = require('./opportunities.json'),
  _ = require('underscore'),
  nano = require('nano')('http://localhost:5984'),
  database = nano.use(dbName);

nano.db.create(dbName, function(err, body){
    database.insert({
      _id: "_design/views",
      views: {
        all: {
          map: "function(doc) {emit(doc._id, doc)}"
        },
        tribes: {
          map: "function(doc) {emit(doc.Futu_Team__c, 1)}",
          reduce: "_count"
        }
      }
    });

  _.each(data, function(opportunity){
    database.insert(opportunity);
  });
});
