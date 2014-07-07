var express = require('express'),
  app = express(),
  path = require('path'),
  port = (process.argv[2] || 8000),
  nano = require('nano')('http://localhost:5984'),
  dbName = 'futurice-super',
  database = nano.use(dbName)
;

app.get('/api/view/:viewName', function(req, res) {

  console.log("View: "+req.params.viewName);
  database.get('_design/views/_view/'+req.params.viewName).pipe(res);

});

app.get('/api/*', function(req, res) {

  console.log("GET " + req.params[0]);
  database.get(req.params[0]).pipe(res);

});

app.use(express.static(__dirname));

app.listen(port);

console.log("Running on http://localhost:" + port + " \nCTRL + C to shutdown");
