// Native modules

// NPM packages
var express = require('express');
var app = express();
var bodyParser = require('body-parser');

// Local packages
var Config = require('./config');

// This is how we access the word clock from the web
var WordClock;
module.exports.start = function(_wordclock) {
	WordClock = _wordclock;
}

// Serve HTML, JS, CSS, and images
app.use(express.static('public'));


// Middlewares
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());


// Get word clock colors
app.get('/colors', function(req, res) {
	res.json(WordClock.getColor());
});


// Set word clock colors
app.post('/colors', function(req, res) {
	var rgb = req.body;
	WordClock.setColors(rgb.r, rgb.g, rgb.b);
	res.json(true);
});


// Get word clock rainbow status
app.get('/rainbow', function(req, res) {
	res.json(WordClock.getRainbow());
});


// Set the rainbow status
app.post('/rainbow', function(req, res) {
	var rainbow = req.body;
	WordClock.setRainbow(rainbow.enabled, rainbow.delay);
	res.json(true);
});


// Hey!  Listen!
app.listen(3000, function() {
	console.log('>>> Web server started');
});
