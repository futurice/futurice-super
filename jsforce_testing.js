var credentials = require('./salesforce-credentials.js');
var jsforce = require('jsforce');

var conn = new jsforce.Connection({});

conn.login(credentials.user, credentials.passwordtoken, function(err, userInfo) {
  if (err) { return console.error(err); }

  console.log("Bearer " + conn.accessToken);
  
  console.log(conn.instanceUrl);

  console.log("User ID: " + userInfo.id);
  console.log("Org ID: " + userInfo.organizationId);
});

// conn.logout(function(err) {
//   if (err) { return console.error(err); }
//   console.log("Logged out.");
// });
