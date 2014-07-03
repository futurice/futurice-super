var credentials = require('./salesforce-credentials.js');
var jsforce = require('jsforce');

var conn = new jsforce.Connection({});

conn.login(credentials.user, credentials.passwordtoken, function(err, userInfo) {
  if (err) { return console.error(err); }

  console.log("Bearer " + conn.accessToken);
  
  console.log(conn.instanceUrl);

  console.log("User ID: " + userInfo.id);
  console.log("Org ID: " + userInfo.organizationId);


conn.query('SELECT Id, Name, Account.Name, Description, Amount, CloseDate, Probability, StageName FROM Opportunity LIMIT 5', function(err, res) {
    if (err) { return console.error(err); }

   	// Information about objects here:
   	// http://www.salesforce.com/us/developer/docs/api/Content/sforce_api_objects_opportunity.htm

    // This query actually does work, but the library is handling it in a weird way.
    // Try with: 
    // curl https://eu1.salesforce.com/services/data/v20.0/query/?q=SELECT+Id,+Name,+Account.Name,+Description,+Amount,+CloseDate,+Probability,+StageName+FROM+Opportunity -H "Authorization: Bearer token"

    console.log(res);
  });
});
