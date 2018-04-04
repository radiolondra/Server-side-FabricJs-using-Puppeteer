require("http").globalAgent.maxSockets = Infinity;

// Modules & server references
var express = require('express');
var ftestpuppet = express(),
    server = require('http').createServer(ftestpuppet),
    io = require('socket.io').listen(server),
    fs = require('fs');

// PUPPETEER reference
const puppeteer = require('puppeteer');

// initialize body-parser to parse incoming parameters requests to req.body
var bodyParser = require('body-parser');
ftestpuppet.use(bodyParser.urlencoded({ extended: true }));

// static folder to serve all files to all pages  
ftestpuppet.use(express.static(__dirname + '/libs'));

// CORS
var cors = require('cors');
ftestpuppet.options('*', cors());

// Path reference
var path = require('path');

// Accept all connection origins
io.set('origins','*:*');

// Listening on port 
server.listen(44533);


// ------------------------------------------------------------
// HTTP ROUTES
// ------------------------------------------------------------
// Send testJson.html page to client
ftestpuppet.get('/', function (req, res) {
	res.sendFile(__dirname + '/testJson.html');
});

// Send template.html to Chromium (Puppeteer)
ftestpuppet.get('/template', function (req, res) {
	res.sendFile(__dirname + '/template.html');
});

// Client request: /process
ftestpuppet.post('/process', function(req, res) {
	// canvas dimensions
	var wantedW = 1920; 
	var wantedH = 1080;
	
	// the json project sent by client
	var data = req.body.mydata;
	
	// the folder where to write the PNG file
	var folder = 'pngs';

	// Creates the pngs folder if needed
	createFolder(__dirname + '/' + folder, 0755, function(err) {
	    if (err) {
		// handle folder creation error
		res.redirect('/');
		}
	    else { // we're all good
		// deletes all (png) files from user folder if any
		cleanFolder(folder);
	    }
	});

	// Quit client
	res.end();

	// Start the job with puppeteer
	(async() => {

		// change headless to false to view the template.html page
		const browser = await puppeteer.launch({headless: true});
		const page = await browser.newPage();

		const projectData = data; // the project sent
		const cw = wantedW; // canvas width
		const ch = wantedH; // canvas height

		const fld = folder;

		try {

		// Opens the template.html page in chromium
		await page.goto('http://localhost/template');

		const ret = await page.evaluate((projectData, cw, ch) => {

			// puts the project data in template.html and prepare everything
			document.getElementById("phantom_indata").value = projectData;
			// prepareProcess() script function is in template.html page
			prepareProcess(cw, ch);

			return 'All set!';
		}, projectData, cw, ch)


		// doJob() script function is in template.html and returns the encoded PNG in dataFrame
		var dataFrame = await page.evaluate( () => {
			doJob();
			return document.getElementById("phantom_outdata").value;
		});

		// Creates the PNG from dataFrame
		dataFrame = dataFrame.replace(/^data:image\/png;base64,/, "");

		// Writes the PNG file
		fs.writeFile(__dirname + '/' + fld + '/test.png', dataFrame, 'base64', function(err, data) {
			if (err) {
			    console.log('err', err);
			}
			console.log('>> test.png file has been saved!');
		});

		} catch (err) {

		console.log('ERR:', err.message);

		} finally {

		browser.close();

		}

	})();

});

// ------------------------------------------------------------
// Creates user folder if needed
// ------------------------------------------------------------
function createFolder(path, mask, cb) {
    if (typeof mask == 'function') { // allow the `mask` parameter to be optional
        cb = mask;
        mask = 0777;
    }
    fs.mkdir(path, mask, function(err) {
        if (err) {
            if (err.code == 'EEXIST') { cb(null); } // ignore the error if the folder already exists
            else { cb(err); } // something else went wrong
        } else { cb(null); } // successfully created folder
    });
}

// ------------------------------------------------------------
// Deletes all files from user folder if any
// ------------------------------------------------------------
function extension(element) {
  var extName = path.extname(element);
  return extName === '.png'; 
};

function cleanFolder(user) {
	fs.readdir(__dirname + '/' + user, function(err, files) {
		if (err) { console.log('Warning: folder not found'); }
		else {
			//for (const file of files) {
      files.filter(extension).forEach(function(file) {
				fs.unlink(__dirname + '/' + user + '/' + file, function(err) {
					if (err) { console.log('Warning: unable to delete file :' + file); }
				});
			});
			console.log(user +' folder has been emptied.');
		}
	});
}

// Export this app
module.exports = ftestpuppet;
