var express = require('express'),
  app = express(),
  path = require('path'),
  port = (process.argv[2] || 8000),
  nano = require('nano')('http://localhost:5984'),
  _ = require('underscore'),
  dbName = 'futurice-super',
  database = nano.use(dbName)
;

app.get('/api/view/:viewName', function(req, res) {

  console.log("View: "+req.params.viewName);
  database.get('_design/views/_view/'+req.params.viewName).pipe(res);

});

app.get('/api/tribes', function(req, res) {

  console.log("Tribes");

  database.get('_design/views/_view/tribes?group=true', function(err, body) {
    var response = body.rows.map(function (row) {
      return {
        name: row.key,
        prettyName: row.key.match(/- ?([a-z0-9 ]+?)$/i)[1]
      };
    });

    res.json(response);
  });

});

app.post('/api/favorites/:projectId', function(req, res){
  var user = req.headers['x-forwarded-user'];

  if (!user){
    res.status(400);

  } else {

    database.get(req.params.projectId, function(err, body){
      if (err) {
        if (err.status_code === 404) {
          res.status(404);
        } else {
          console.log(err);
        }
      } else {
        if (!body.FavoritedBy){
          body.FavoritedBy = [];
        }

        if (!_.contains(body.FavoritedBy, user)) {
          body.FavoritedBy.push(user);
        }

        database.insert(body, body.id, function(){
            res.send('User '+user+' favorited opportunity '+ body.Name);
          }, function(err){
            console.log(err);
        });

      }
    });
  }
});

app.get('/api/user', function(req, res){
  res.send(req.headers['x-forwarded-user']);
});

app.get('/api/*', function(req, res) {

  console.log("GET " + req.params[0]);
  database.get(req.params[0]).pipe(res);

});


app.use(express.static(__dirname));

app.listen(port);

console.log("Running on http://localhost:" + port + " \nCTRL + C to shutdown");
