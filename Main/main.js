//This file handles the webiste and the remote sections

const http = require('http');
const formidable = require('formidable');
const fs = require('fs');
const url = require('url');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

//Home and alarm pages for dynamic generation
var start_home = `
	<!DOCTYPE html>

<html>
	<head>
		<title>Wireless Alarm</title>
	</head>
	<body>
		<center>
			<h1>The Wireless Alarm</h1>
			<br/>
			<br/>
			<br/>
			<u><b><h3>Current Alarms</h3></b></u>
	`

var end_home = `
				<h4><a href="/alarms">Want to configure your alarms, click here</a></h4>

		</center>
	</body>
</html>
	`

//Helper functions

function returnDefaultPage(name, response, URS) {
	//This function takes the name of a default page and then returns it
	fs.readFile(__dirname + "/defaultPages/"+name+".html", function(error, data){
		if (error) {console.log(error);} //Deal with errors

		console.log("[" + URS + "]Responding with the "+name+" page.");

		response.writeHead(200, {"Content-Type": "text/html"});
		response.write(data, "utf8");
		response.end();
	});
}

function returnHomePage(response) {
	//This function dynamically generates the home page, allowing for alarms to be displayed

	//Generate the home page
	//Connect to the database
	const dbPath = path.resolve(__dirname, 'database.db')
	var current_alarms = "";

	var db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
		if (err) {
		console.error(err.message);
		}

		console.log('Connected successfully to the database.');

		//This function dynamically generates the alarm page, allowing for alarms to be displayed
		var sql = `SELECT * FROM alarms ORDER BY name`;

		db.all(sql, [], (err, rows) => {
			if (err) {
				throw err;
			}
			rows.forEach((row) => {
				//Build a HTML interpretation of the rows with each with all the info and a button to delete
				current_alarms += "<p>" + row.name + " : " + row.time + " | Priority: " + row.priority +  " | Type: " + row.type + "| <a href=\"/delete?name=" + row.name + "\">Click to delete</a></p>"
			});

			//Close the connection to the database
			db.close((err) => {
				if (err) {
					return console.error(err.message);
				}
				console.log('Close the database connection.');

				var home_page = start_home + current_alarms + end_home;

				response.writeHead(200, {"Content-Type": "text/html"});
				response.write(home_page, "utf8");
				response.end();
				
			});
		});
	})
}
function deleteAlarm(name, response, URS) {
	//This function will delet a alarm and return the default page

	//Connect to the database
	const dbPath = path.resolve(__dirname, 'database.db')
	var current_alarms = "";

	var db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
		if (err) {
		console.error(err.message);
		}

		console.log('Connected successfully to the database.');

		//This function dynamically generates the alarm page, allowing for alarms to be displayed

		db.run(`DELETE FROM alarms WHERE name=?`, name, function(err) {
			if (err) {
		    	return console.error(err.message);
		  	}

		  	//Close the connection to the database
			db.close((err) => {
				if (err) {
					return console.error(err.message);
				}
				console.log('Close the database connection.');

				if (err) {
					returnDefaultPage('fail', response, URS);
				} else {
					returnDefaultPage('deleted', response, URS);
				}
				
			});
		});
	})
}


function addAlarm(name, time, type, priority, response, URS) {
	//This function takes the data about an alarm and adds it to the database
	//Connect to the database
	var error = false;

	const dbPath = path.resolve(__dirname, 'database.db')
	var current_alarms = "";

	//Check the time frame, make sure that it is correct and it is formatted correctly
	console.log(time);
	var times = time.split(':');
	if (times.length == 3 || times.length == 2) {
		//Formats allowed are
		// HOURS:MINUTES
		// HOURS:MINUTES:SECONDS
		try {
			var hours = parseInt(times[0]);
			var minutes = parseInt(times[1]);
			if (times.length == 3) {
				var seconds = parseInt(times[2]);
			}
		} catch (fail){
			//Error, time phrase isnt correct. Deny
			error = true;
		}
		
	} else {
		error = true;
	}

	if (error) {
		returnDefaultPage("failed", response, URS);
		return;
	}

	var db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
		if (err) {
		console.error(err.message);
		}

		console.log('Connected successfully to the database.');

		//This function dynamically generates the alarm page, allowing for alarms to be displayed
		db.run(`INSERT INTO alarms VALUES('${name}', '${time}', ${priority}, '${type}')`, function(err) {
			if (err) {
		    	return console.error(err.message);
		  	}

		  	//Close the connection to the database
			db.close((err) => {
				if (err) {
					return console.error(err.message);
				}
				console.log('Close the database connection.');

				if (err) {
					returnDefaultPage("failed", response, URS);
				} else {
					returnDefaultPage("AA", response, URS);
				}
			});
		});
	})
}

//General variable definition
var CURS = 0;

//Spawn our python script to set off alarms
var spawn = require('child_process').spawn,
    py    = spawn('python', ['useAlarm.py']),
    dataString = '';

py.stdout.on('data', function(data){
  dataString += data.toString();
  console.log("Recieved data: " + data);
});
py.stdout.on('end', function(){
  console.log('Python program shutdown');
});
py.stdin.write(JSON.stringify(["start"]));
py.stdin.end();

//Main HTTP server, asyncronous creation
http.createServer(function (request, response) {
	
	var URS = CURS; //Theese variables deal with console output so that requests and responses don't get mixed
	CURS += 1;

	console.log("[" + URS + "]Got a connection with the request of: " + request.url);

	var q = url.parse(request.url, true).query; //This is all the arguments from the url, used in GET requests
	var path = url.parse(request.url).pathname; //This is the arguments from the pathname in the url


	switch(path) {
		case ('/alarms'):
			//Return the alarm page
			returnDefaultPage('addAlarm', response, URS);
			break;

		case('/addAlarm'):
			var form = new formidable.IncomingForm();
			form.parse(request, function (err, fields, files) {
				console.log("[" + URS + "]Creating the alarm.");
				addAlarm(fields.name, fields.time, fields.type, fields.priority, response, URS);
			});
			break;

		case('/'):
			//Return the home page.

			console.log("[" + URS + "]Responding with the home page.");
			returnHomePage(response);
			break; 

		case('/delete'):
			var alarm_name = q.name;
			deleteAlarm(alarm_name, response, URS);
			break;

		default:
			fs.readFile(__dirname + path, function(error, data){

				if (error){
					returnDefaultPage("404", response, URS);
				}
				else{
					console.log("[" + URS + "]Responding with a found page(200).");
					response.writeHead(200, {"Content-Type": "text/" + path.split(".")[1]});
					response.write(data, "utf8");
					response.end();
				}
			});
			break;
	}
}).listen(80, '192.168.0.23'); //Listen on port 80