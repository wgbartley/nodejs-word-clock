var neopixel = require('rpi-ws281x');
var Config = require('./config');

var ROWS = Config.height;
var COLS = Config.width;
var CHARS = Config.chars;

var pixels = new Uint32Array(ROWS*COLS).fill(0);
var rainbow_j = 0;
var rainbow_color;
var rainbow_enabled = false;
var rainbow_delay = 50;

var last_minute = -1;
var _r = 0;
var _g = 0;
var _b = 255;
var _color = Color(_r, _g, _b);


// Mimics Arduino setup function
function setup() {
	// Initialize the library
	neopixel.configure(Config);

	// Make sure everything is black
	blackOut();

	// Start applyRainbow()
	applyRainbow();

	// This is not for the Arduino
	setTimeout(loop, 1);
}


// Mimics Arduino loop function
function loop() {
	ticktock();

	neopixel.render(pixels);

	// This is not for the Arduino
	setTimeout(loop, 10);
}


function ticktock() {
	var d = new Date();

	// Round the minute to the nearest 5-minute interval
	var minute = 5 * Math.round((d.getMinutes()+d.getSeconds()/60)/5);

	if(minute==last_minute)
		return;

	if(Config.debug) console.log('TICK TOCK');

	blackOut();

	// Default words
	doWord('IT');
	doWord('IS');
	doWord(`O'CLOCK`);

	last_minute = minute;


	// Determine TO / PAST
	if(minute>30 && minute!=0)
		doWord('TO');
	else if(minute<=30 && minute!=0)
		doWord('PAST');


	// Setting this flag will show "MINUTES"
	var showMinutes = true;


	// Determine which word to light up for the minutes
	switch(minute) {
		case 0:
			showMinutes = false;
			break;
		case 5:
		case 55:
			doWord('FIVE');
			break;
		case 10:
		case 50:
			doWord('TEN');
			break;
		case 15:
		case 45:
			doWord('FIFTEEN');
			break;
		case 20:
		case 40:
			doWord('TWENTY');
			break;
		case 25:
		case 35:
			doWord('TWENTY');
			doWord('FIVE');
			break;
		case 30:
			doWord('HALF');
			showMinutes = false;
			break;
	}

	// Show "MINUTES"
	if(showMinutes)
		doWord('MINUTES');


	// The hour
	var hour = d.getHours();

	// Convert to 12-hour format
	if(hour>12)
		hour -= 12;

	// Do we need to increment the hour for the "TO"?
	if(minute>30)
		hour++;

	// Fix for 13 o'clock
	if(hour==13)
		hour = 1;


	switch(hour) {
		case 1:
			doWord('ONE');
			break;
		case 2:
			doWord('TWO');
			break;
		case 3:
			doWord('THREE');
			break;
		case 4:
			doWord('FOUR');
			break;
		case 5:
			doWord('FIVE', true);
			break;
		case 6:
			doWord('SIX');
			break;
		case 7:
			doWord('SEVEN');
			break;
		case 8:
			doWord('EIGHT');
			break;
		case 9:
			doWord('NINE');
			break;
		case 10:
			doWord('TEN', true);
			break;
		case 11:
			doWord('ELEVEN');
			break;
		case 0:
		case 12:
			doWord('TWELVE');
			break;
	}
}


function blackOut() {
	for(var i=0; i<ROWS*COLS; i++) {
		pixels[i] = 0;
	}
}


function doWord(word, skip) {
	if(typeof skip=='undefined')
		skip = false;

	if(Config.debug && Config.verbose) {
		console.log('===');
		console.log('WORD:', word);
		console.log('SKIP:', skip);
	}

	var chars = Config.chars;

	var row = 0;
	var col = 0;

	var map = Config.chars.split("\n");
	var found_it = false;
	for(r=0; r<map.length; r++) {
		if(map[r].indexOf(word)>-1 && !found_it) {
			if(!skip) {
				if(Config.debug && Config.verbose) console.log('LINE:', map[r]);
				row = ROWS-r;
				col = map[r].indexOf(word);
				found_it = true;
			} else
				skip = false;
		}
	}

	if(Config.debug && Config.verbose) {
		console.log('ROW:', row, 'of', ROWS);
		console.log('COL:', col, 'of', COLS);
		console.log('LENGTH:', word.length);
	}

	var p = ((row-1)*COLS)+col;
	if(Config.debug && Config.verbose) console.log('PIXEL:', p);

	for(var i=p; i<p+word.length; i++) {
		pixels[i] = _color;
	}

	if(Config.debug && Config.verbose) {
		console.log('---');
		console.log('');
	}
}


function applyRainbow() {
	if(!rainbow_enabled) {
		setTimeout(applyRainbow, rainbow_delay);
		return;
	}

	rainbow_color = Wheel(rainbow_j);
	rainbow_j++;

	if(rainbow_j>=256)
		rainbow_j = 0;

	for(var i=0; i<ROWS*COLS; i++) {
		if(pixels[i]>0)
			setPixelColor(i, Color(rainbow_color[0], rainbow_color[1], rainbow_color[2]));
	}

	setTimeout(applyRainbow, rainbow_delay);
}


// Input a value 0 to 255 to get a color value
// The colors are a transition r - g - b - back to r
function Wheel(WheelPos) {
	if(WheelPos < 85) {
		return [WheelPos*3, 255-WheelPos*3, 0];
	} else if(WheelPos < 170) {
		WheelPos -= 85;
		return [255-WheelPos*3, 0, WheelPos*3];
	} else {
		WheelPos -= 170;
		return [0, WheelPos*3, 255-WheelPos*3];
	}
}


function setPixelColor(i, c) {
	pixels[i] = c;
}


function Color(r, g, b) {
	_r = r;
	_g = g;
	_b = b;
	return (r << 16) | (g << 8) | b;
}


module.exports.start = function() {
	console.log('>>> Word clock started');
	setup();
};


module.exports.setColors = function(r, g, b) {
	console.log(`>>> Setting colors to ${r}, ${g}, ${b}`);
	_color = Color(r, g, b);
	last_minute = -1;
}


module.exports.getColor = function() {
	return [_r, _g, _b];
}


module.exports.setRainbow = function(enabled, delay) {
	rainbow_enabled = JSON.parse(enabled);
	rainbow_delay = JSON.parse(delay);

	console.log(`>>> Setting rainbow enabled ${rainbow_enabled}, ${rainbow_delay} ms`);

	last_minute = -1;
}


module.exports.getRainbow = function() {
	return [rainbow_enabled, rainbow_delay];
}
