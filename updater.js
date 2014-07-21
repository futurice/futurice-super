'use strict';

var credentials = require('./salesforce-credentials.js'),
  jsforce = require('jsforce'),
  _ = require('underscore'),
  nano = require('nano')('http://localhost:5984'),
  schedule = require('node-schedule'),
  dbName = 'futurice-super',
  database = nano.use(dbName),
  conn = new jsforce.Connection({}),
  zeropad,
  createDatabase,
  addViews,
  addOrUpdateDocument,
  addOpportunities,
  removeDeletedOpportunities,
  updateSalesforceData;

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
      if (err.status_code === 404){
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

addOpportunities = function(opportunities){
  console.log("Adding Opportunities to CouchDB.");

  _.each(opportunities, function(opportunity){
    addOrUpdateDocument(opportunity, function(){
      console.log(opportunity.Name);
    }, function(err){
      console.log(err);
    });
  });
};

removeDeletedOpportunities = function(opportunities){
  console.log("Removing deleted Opportunities from CouchDB.");

  database.list(function(err, body) {
    if (err) {
      console.log(err);
      return;
    }

    var existingOpportunities = _.map(body.rows, function(doc) {return doc.id});
    var opportunitiesArray = _.map(opportunities, function(doc) {return doc.Id});
    var toRemove = _.difference(existingOpportunities, opportunitiesArray);

    _.each(toRemove, function(doc){
      // Check for Salesforce ID so we only remove those docs.
      if(doc.match(/^[a-z0-9]+$/i)){
        console.log("Removing: " + doc);
        var fullDoc = _.find(body.rows, function(row){return row.id === doc});
        database.destroy(doc, fullDoc.value.rev, function(err){
          if (err) {
            console.log(err);
          }
        });
      }
    });
  });
};

/*
 * Salesforce logic.
 */
updateSalesforceData = function() {

  console.log("Running update on ", new Date());

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
    'Owner.Name, Owner.Id, Owner.Alias, Description, Amount, CloseDate, '+
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

      console.log("Checking for database.");
      createDatabase(function(){
        console.log("Database created successfully.");
        addOpportunities(res.records);
      }, function(err){
            if (err.error === 'file_exists') {
              console.log("Database exists.");
              addOpportunities(res.records);
              removeDeletedOpportunities(res.records);
            } else {
              console.log(err);
            }
      });
    });
  });
};

/*
 * Schedule updating the DB
 */

// Every 30minutes during work hours.
var workHours = schedule.scheduleJob('*/30 8-18 * * 1-5', function(){
  updateSalesforceData();
});

// Certain times during the evening/night on weekdays.
var weekNights = schedule.scheduleJob('0 20,22,0,6 * * 1-5', function(){
  updateSalesforceData();
});

// Weekends, every four hours.
var weekends = schedule.scheduleJob('0 */4 * * 0,6', function(){
  updateSalesforceData();
});


/*
 * Run an update
 */
 updateSalesforceData();
