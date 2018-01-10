//Main.js
/*
This script deals with HTTP requests.
It deals with all the traffic and it also deals with addind and removing alarms from the database.
It also deals with input, and starting up the python script
*/


//===================================================================\\
//Constants
//===================================================================\\
const http = require('http');
const formidable = require('formidable');
const fs = require('fs');
const url = require('url');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

var start_home = `
<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">

		<title>Wireless alarm</title>
		<link rel="stylesheet" href="homepage.css">
		<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
		<script src="jquery.js"></script>
	</head>

	<body>
		<div class="background">
			<div>

				<div class="sidebar">

					<div class="sidebar_header">
						<div class="bottom_line"></div>
						<b>Access bar</b>
					</div>

					<div class="sidebar_bottom">
						<a href="/" class="sidebutton_link selected">
							<div class="sidebutton selected">
									<b>Current Alarms</b></br>
							</div>
						</a>
					</div>


					<div class="sidebar_bottom">
						<a href="/AddAlarms.html" class="sidebutton_link selected">
							<div class="sidebutton">
									<b>Add alarms</b>
							</div>
						</a>
					</div>


					<div class="sidebar_bottom">
						<a href="/Admin.html" class="sidebutton_link selected">
							<div class="sidebutton">
									<b>Admin</b>
							</div>
						</a>
					</div>

				</div>
			</div>

			<!--Begin on the current alarms and end of the side bar -->

			<div class="current_alarms">

				<div class="current_alarms_header">
					<h1><b>Current alarms</b></h1>
				</div>


				<div id="alarms">

`;

var end_home = `

				</div>

			</div>
		</div>
	</body>
</html>
`;


var start_admin = `
<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">

		<title>Wireless alarm</title>
		<link rel="stylesheet" href="Admin.css">
		<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
		<script src="jquery.js"></script>
	</head>

	<body>
		<div class="background">
			<div>

				<div class="sidebar">

					<div class="sidebar_header">
						<div class="bottom_line"></div>
						<b>Access bar</b>
					</div>

					<div class="sidebar_bottom">
						<a href="/" class="sidebutton_link selected">
							<div class="sidebutton">
									<b>Current Alarms</b></br>
							</div>
						</a>
					</div>


					<div class="sidebar_bottom">
						<a href="/AddAlarms.html" class="sidebutton_link selected">
							<div class="sidebutton">
									<b>Add alarms</b>
							</div>
						</a>
					</div>


					<div class="sidebar_bottom">
						<a href="/Admin.html" class="sidebutton_link selected">
							<div class="sidebutton selected">
									<b>Admin</b>
							</div>
						</a>
					</div>

				</div>
			</div>

			<!--Begin on the current alarms and end of the side bar -->

			<div class="current_alarms">

				<div class="current_alarms_header">
					<h1><b>Admin</b></h1>
				</div>


				<div id="alarms">

`;

var end_admin = `

				</div>

			</div>
		</div>
	</body>
</html>
s
`;





//===================================================================\\
//Helper Functions
//===================================================================\\

function returnDefaultPage(name, response, URS) {
	/*
	This function takes in the name of the defualt page, the response and the URS number.
	Returns: Nothing
	Function: Responds to the response with the default page, if there is one with that name
	*/
	fs.readFile(__dirname + "/defaultPages/"+name+".html", function(error, data){
		if (error) {
			//Failed to find the page, log Error
			console.log(error);
		} else{
			console.log("[" + URS + "]Responding with the "+name+" page.");
			if (name == "404") {
				response.writeHead(404, {"Content-Type": "text/html", 'Cache-Control': 'no-cache'});
			} else {
				response.writeHead(200, {"Content-Type": "text/html", 'Cache-Control': 'no-cache'});
			}
			response.write(data, "utf8");
			response.end();
		}
	});
}

function returnHomePage(response) {
	/*
	This function takes the response variables
	Returns: Null
	Function: takes the response and sends it back to the client
	*/
	const dbPath = path.resolve(__dirname, 'database.db')
	var current_alarms = "";

	var db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => { //Connect to the database
		if (err) {console.log(err);}

		var sql = `SELECT * FROM alarms ORDER BY name`;

		db.all(sql, [], (err, rows) => {
			if (err) {console.log(err);}

			rows.forEach((row) => {

				current_alarms += `
				<div class="alarm">
					<div class="title">
						` + row.name + `
						<br/>
						` + row.time + `
					</div>
					<div class="alarm_information">
						<center>
							<table>
								<tr>
									<th>Time</th>
									<th>Mon</th>
									<th>Tue</th>
									<th>Wed</th>
									<th>Thur</th>
									<th>Fri</th>
									<th>Sat</th>
									<th>Sun</th>
								</tr>
								<tr>
									<td>` + row.time + `</td>
									<td>` + row.EveryMonday + `</td>
									<td>` + row.EveryTuesday + `</td>
									<td>` + row.EveryWednesday + `</td>
									<td>` + row.EveryThursday + `</td>
									<td>` + row.EveryFriday + `</td>
									<td>` + row.EverySaturday + `</td>
									<td>` + row.EverySunday + `</td>
								</tr>
							</table>
						</center>

					</div>
				</div>

				<div class="alarm_divider"></div>
				`
			});

			db.close((err) => {
				if (err) {console.log(err);}

				var home_page = start_home + current_alarms + end_home;

				response.writeHead(200, {"Content-Type": "text/html", 'Cache-Control': 'no-cache'});
				response.write(home_page, "utf8"); //Return the homepage
				response.end();

			});
		});
	})
}

function returnAdminPage(response) {
	/*
	This function takes the respone variables
	Returns: Nothing
	Function: It returns a dynamically generated admin page
	*/
	const dbPath = path.resolve(__dirname, 'database.db')
	var current_alarms = "";

	var db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
		if (err) {console.log(err);}

		var sql = `SELECT * FROM alarms ORDER BY name`;

		db.all(sql, [], (err, rows) => {
			if (err) {console.log(err);}
			rows.forEach((row) => {

				current_alarms += `
				<div class="alarm">
					<div class="title">
						` + row.name + `
						<br/>
						` + row.time +`
					</div>
					<div class="alarm_information">
						<center>
							<div class="delete">
								<a href="/delete?name=` + row.name + `" class="confirm">Delete this alarm</a>
							</div>
						</center>

					</div>
				</div>

				<div class="alarm_divider"></div>
				`
			});


			db.close((err) => {
				if (err) {console.log(err);}

				var home_page = start_admin + current_alarms + end_admin;

				response.writeHead(200, {"Content-Type": "text/html", 'Cache-Control': 'no-cache'});
				response.write(home_page, "utf8"); //Return the admin page
				response.end();

			});
		});
	})
}

function deleteAlarm(name, response, URS) {
	/*
	This function takes in the name, the response value and the URS
	Returns: None
	Function: It takes the name of a alarm and deletes it then returns the deleted page
	*/

	const dbPath = path.resolve(__dirname, 'database.db')
	var current_alarms = "";

	var db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
		if (err) {console.log(err);}

		db.run(`DELETE FROM alarms WHERE name=?`, name, function(err) {
			if (err) {console.log(err);}

			db.close((err) => {
				if (err) {console.log(err);}

				if (err) { //If an error was thrown it failed, else it succeded
					returnDefaultPage('fail', response, URS);
				} else {
					returnDefaultPage('deleted', response, URS);
				}

			});
		});
	})
}


function addAlarm(name, time, monday, tuesday, wednesday, thursday, friday, saturday, sunday, response, URS) {
	/*
	This function takes the data of a alarm then adds it to the Database
	Returns: Nothing
	Functions: Adds a alarm then returns a page depending on the status of the added alarm
	*/
	var error = false;

	const dbPath = path.resolve(__dirname, 'database.db')
	var current_alarms = "";

	if ((monday=='FALSE') && (tuesday=='FALSE') && (wednesday=='FALSE') && (thursday=='FALSE') && (friday=='FALSE') && (saturday=='FALSE') && (sunday=='FALSE')) { //Check to make sure that one of the times is selected
		returnDefaultPage("select_one", response, URS);
		return;
	}


	var times = time.split(':');
	if (times.length == 3 || times.length == 2) { //Check if the time frame is allowed, if so accept, else respond the alarm failed and return
		try {
			var hours = parseInt(times[0]);
			var minutes = parseInt(times[1]);
			if (times.length == 3) {
				var seconds = parseInt(times[2]);
			}
		} catch (fail){
			error = true;
		}

	} else {
		error = true;
	}

	if (error) { //Returned failed page
		returnDefaultPage("failed", response, URS);
		return;
	}

	var db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
		if (err) {console.log(err);}

		//Insert alarm to db
		db.run(`INSERT INTO alarms VALUES('${name}', '${time}', '${monday}', '${tuesday}', '${wednesday}', '${thursday}', '${friday}', '${saturday}', '${sunday}')`, function(err) {
			if (err) {console.log(err);}

			db.close((err) => {

				if (err) {
					console.log(err);
					returnDefaultPage("failed", response, URS);
				} else {
					returnDefaultPage("AA", response, URS);
				}
			});
		});
	})
}

//===================================================================\\
//Variables & Constants
//===================================================================\\
var CURS = 0;
const blacklist = ['/Main.js', '/database.db', '/README', '/useAlarm.py'];

//===================================================================\\
//Python script
//===================================================================\\
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

//===================================================================\\
//Main HTTP server
//===================================================================\\
http.createServer(function (request, response) {

	var URS = CURS; //Theese variables deal with console output so that requests and responses don't get mixed
	CURS += 1;

	console.log("[" + URS + "]Got a connection with the request of: " + request.url);

	var q = url.parse(request.url, true).query; //This is all the arguments from the url, used in GET requests
	var path = url.parse(request.url).pathname; //This is the arguments from the pathname in the url


	switch(path) {
		case('/addAlarm'):
			/*
			This case takes the request to add a new alarm and adds it.
			*/
			var form = new formidable.IncomingForm();
			form.parse(request, function (err, fields, files) {
				console.log("[" + URS + "]Creating the alarm.");
				addAlarm(fields.name, fields.time, fields.monday, fields.tuesday, fields.wednesday, fields.thursday, fields.friday, fields.saturday, fields.sunday, response, URS);
			});
			break;

		case('/'):
			/*
			This case takes the request for the homepage and returns it.
			*/
			console.log("[" + URS + "]Responding with the home page.");
			returnHomePage(response);
			break;

		case('/AddAlarms.html'):
			/*
			This case takes the request for the page on alarms and responds with addAlarm page
			*/
			returnDefaultPage('AddAlarm', response, URS);
			break;

		case('/delete'):
			/*
			This case takes the request to delete an alarm and deletes it
			*/
			var alarm_name = q.name;
			deleteAlarm(alarm_name, response, URS);
			break;

		case('/Admin.html'):
			/*
			This case takes the request for the admin page and returns it
			*/
			console.log("[" + URS + "]Responding with the admin page.");
			returnAdminPage(response);
			break;

		default:
			/*
			This case takes the request for any unrecognized page, searches for it and returns it.
			*/
			//Check for blacklist
			if (blacklist.indexOf(path) >= 0){
				//Deny request, it is in the blacklist.
				returnDefaultPage("404", response, URS);
				return;
			}
			fs.readFile(__dirname + path, function(error, data){
				if (error){
					fs.readFile(__dirname + "/Jquery" + path, function(error, data){
						if (error){
							fs.readFile(__dirname + "/CSS" + path, function(error, data){
								if (error){
									fs.readFile(__dirname + "/Resources" + path, function(error, data){
										if (error){
											returnDefaultPage("404", response, URS);
										}
										else{
											console.log("[" + URS + "]Responding with a found page(200).");
											response.writeHead(200, {"Content-Type": "text/" + path.split(".")[1], 'Cache-Control': 'no-cache'});
											response.write(data, "utf8");
											response.end();
										}
									});
								}
								else{
									console.log("[" + URS + "]Responding with a found page(200).");
									response.writeHead(200, {"Content-Type": "text/" + path.split(".")[1], 'Cache-Control': 'no-cache'});
									response.write(data, "utf8");
									response.end();
								}
							});
						}
						else{
							console.log("[" + URS + "]Responding with a found page(200).");
							response.writeHead(200, {"Content-Type": "text/" + path.split(".")[1], 'Cache-Control': 'no-cache'});
							response.write(data, "utf8");
							response.end();
						}
					});
				}
				else{
					console.log("[" + URS + "]Responding with a found page(200).");
					response.writeHead(200, {"Content-Type": "text/" + path.split(".")[1], 'Cache-Control': 'no-cache'});
					response.write(data, "utf8");
					response.end();
				}
			});
			break;
	}
}).listen(80, '192.168.0.23'); //Listen on port 80
