var express = require('express'),
app = express(),
path = require('path'),
port = (process.argv[2] || 8000);


app.get('/api/:file.json', function(req, res) {
  console.log(req.params.file);
  
  var response = [
    {
      "id": 1,
      "title": "SUPER",
      "description": "Salesforce Upcoming Projects Evaluation Rankings",
      "favorite": false
    },
    {
      "id": 2,
      "title": "Über",
      "description": "Ünderständing better external resources",
      "favorite": false
    }
  ];

  res.json(response);
});

app.use(express.static(__dirname));

app.listen(port);

console.log("Running on http://localhost:" + port + " \nCTRL + C to shutdown");
