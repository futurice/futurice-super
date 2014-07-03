#!/bin/sh

SERVER='http://localhost:5984/'
COLLECTION='futurice-super'
POST_URL="$SERVER$COLLECTION/"

echo "Deleting old collection."
curl -H 'Content-Type: application/json' -X DELETE $POST_URL

echo "Creating collection."
curl -H 'Content-Type: application/json' -X PUT $POST_URL 

echo "Inserting mock data to ${SERVER}."
curl -H 'Content-Type: application/json' -X POST -d '{"title": "SUPER","description": "Salesforce Upcoming Projects Evaluation Rankings","favorite": false}' ${POST_URL}
curl -H 'Content-Type: application/json' -X POST -d '{"title": "Über","description": "Ünderständing better external resources","favorite": false}' ${POST_URL}

echo "Current status:"
curl $POST_URL 