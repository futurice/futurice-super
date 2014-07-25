/*
 * This file specifies the Salesforce and CouchDB settings
 * for the project.
 *
 * Settings are read from environment variables or if those
 * are not found, from the default values specified here.
 *
 * If you change the settings here you must _not_ commit
 * the changes.
 */
var user = process.env.SFORCE_USER || 'email@example.com',
  password = process.env.SFORCE_PASSWORD || '<password>',
  token = process.env.SFORCE_TOKEN || '<token>',
  couchdb = process.env.COUCHDB_URI || 'http://localhost:5984',
  database = process.env.COUCHDB_DB || 'super';

exports.salesforce = {
  user: user,
  passwordtoken: password + token
};

exports.couchdb ={
  uri: couchdb,
  database: database
};
