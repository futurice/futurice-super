'use strict';

var credentials = require('./salesforce-credentials.js'),
  jsforce = require('jsforce'),
  _ = require('underscore'),
  nano = require('nano')('http://localhost:5984'),
  dbName = 'futurice-super',
  database = nano.use(dbName),
  conn = new jsforce.Connection({}),
  zeropad,
  createDatabase,
  insertDocument,
  addOrUpdateDocument,
  addViews,
  opportunities = [];

/*
 * Utilities.
 */
zeropad = function(number, length){

  var numString = number+"";

  if (numString.length >= length) {
    return numString;
  } else {
    return zeropad("0"+numString, length);
  }

};

/*
 * CouchDB logic.
 */
createDatabase = function(successCallback, errorCallback){
  return nano.db.create(dbName, function(err, body){
    if (err){
      errorCallback(err, body);
    } else {
      addViews();
      successCallback();
    }
  });
};

addViews = function(){
  var designDocuments = [
    {
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
    }
  ];

  _.each(designDocuments, function(doc){
    console.log("Adding design document: ", doc._id);
    database.insert(doc, doc._id);
  });
};

addOrUpdateDocument = function(doc, successCallback, errorCallback) {
  // Get existion document to get current revision.
  database.get(doc.Id, function(err, body){
    if (err) {
      if (err.reason === 'missing'){
        // New document
        database.insert(doc, doc.Id, successCallback, errorCallback);

      } else {
        console.log(err);
        if (typeof errorCallback === 'function'){
          errorCallback(err, body);
        }
      }
    } else {

      // Existing document, specify revision and transfer favorites.
      doc._rev = body._rev;
      if (body.FavoritedBy) {
        doc.FavoritedBy = body.FavoritedBy;
      }

      database.insert(doc, doc.Id, function(err, body){
        if (err && typeof errorCallback === 'function') {
          errorCallback(err, body);
        } else if (typeof successCallback === 'function') {
          successCallback(err, body);
        }
      });

    }
  });
};

/*
 * Salesforce logic.
 */
conn.login(credentials.user, credentials.passwordtoken, function(err, userInfo) {
  if (err) { return console.error(err); }

  console.log("Bearer " + conn.accessToken);

  console.log(conn.instanceUrl);

  console.log("User ID: " + userInfo.id);
  console.log("Org ID: " + userInfo.organizationId);

  var closed_date = new Date(new Date() - (3*30*24*60*60*1000)); // Months, Days, Hours...
  var dateArray = [
    closed_date.getFullYear(),
    zeropad(closed_date.getUTCMonth()+1, 2),
    zeropad(closed_date.getUTCDay(), 2)
  ];
  var date = dateArray.join('-');


console.log("Querying Salesforce.");

conn.query('SELECT Id, Name, Account.Name, Account.Id, '+
  'Owner.Name, Owner.Id, Description, Amount, CloseDate, '+
  'Probability, StageName, IsClosed, IsWon, '+
  'Budgeted_Work_End_Date__c, Budgeted_Work_Start_Date__c, Average_Hour_Price__c, '+
  'Type, Futu_Team__c, LastModifiedDate, CreatedDate '+
  'FROM Opportunity WHERE CloseDate > ' + date,
  function(err, res) {
    if (err) { return console.error(err); }

    // Information about objects here:
    // http://www.salesforce.com/us/developer/docs/api/Content/sforce_api_objects_opportunity.htm

    // "Describe" in API:
    // https://eu1.salesforce.com/services/data/v30.0/sobjects/Opportunity/describe

    console.log('Done: ' + res.done);
    console.log("Fetched Opportunities from Salesforce.");

    var addOpportunities = function(){
      console.log("Adding Opportunities to CouchDB.");
          _.each(res.records, function(opportunity){
            addOrUpdateDocument(opportunity, function(){
              console.log(opportunity.Name);
            }, function(err){
              console.log(err);
            });
          });
    };

    console.log("Checking for database.");
    createDatabase(function(){
      console.log("Database created successfully.");
      addOpportunities();
    }, function(err){
          if (err.error === 'file_exists') {
            console.log("Database exists.");
            addOpportunities();
          } else {
            console.log(err);
          }
    });

  });
});



