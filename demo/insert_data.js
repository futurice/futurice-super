var dbName = 'super-demo';
var data = require('./opportunities.json'),
  _ = require('underscore'),
  nano = require('nano')('http://localhost:5984'),
  database = nano.use(dbName);

console.log("Inserting dummy data.");

nano.db.destroy();

nano.db.create(dbName, function(err, body){
  console.log("Database created.");

  _.each(data, function(opportunity){
    console.log("Inserting: "+ opportunity.Name);
    database.insert(opportunity, function(err){
      if (err) {
        console.log(err);
      }
    });
  });
});
