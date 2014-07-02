# SUPER - Salesforce Upcoming Project Evaluation Rankings

# About

The purpose of this project is to promote transparency of the sales pipeline and help sales decide what cases to prioritize. This would be done by providing an interface for tribe-members to see upcoming cases and allow them to vote for the cases they find interesting. There could also be functionality for commenting and asking for more information about a case.

# Development

Requirements:

 * [Node and npm](http://nodejs.org/)

LiveReload might also need [Grunt](http://gruntjs.com/) if you don't have support for that in your editor of choice.

## Setting up

All you need to do is clone the repository and run `npm start`.
This will install all necessary dependencies and start the server at [localhost:8000](http://localhost:8000).

```bash
$ git clone https://github.com/futurice/futurice-super.git
#...
$ npm start
```

For LiveReload via Grunt:

```bash
$ grunt
```

# Polymer architecture


index.html
* service -> {{ projects }}
* project list <- {{ projects }}
	* N * project card <- {{ project }}
		* button -> {{ project.add/removeFavorite() }}

# Salesforce connection

We're using the [JSforce](http://jsforce.github.io/) library for the Salesforce API connection.

From salesforce documentation:

	When accessing salesforce.com either via a desktop client or the API from outside of your company's trusted networks:
	 
	If your password = "mypassword"
	And your security token = "XXXXXXXXXX"
	You must enter "mypasswordXXXXXXXXXX" in place of your password

So, to test queries from REPL (assuming you have installed JSforce globally):

```bash
$ jsforce
# ...

> login('user@example.com', '<password><token>')
{ id: '0000',
  organizationId: '0000',
  url: 'https://login.salesforce.com/id/0000/0000' }

> query('SELECT Id, Name FROM Account LIMIT 1')
{ totalSize: 1,
  done: true,
  records: 
   [ { attributes: [Object],
       Id: '0000',
       Name: 'Company X' } ] }
```

