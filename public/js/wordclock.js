var chars = "" +
	"ITHISAHALFP" +
	"TENPFIFTEEN" +
	"TWENTYYFIVE" +
	"MINUTESBTOI" +
	"RPASTTEIGHT" +
	"HDTENINEAYG" +
	"ATHREELEVEN" +
	"SEVENRFOURY" +
	"BETWELVEVER" +
	"FIVELETWONE" +
	"SIXEO'CLOCK";

var COLS = 11;
var ROWS = 11;
var pixels = [];
var rainbow_j = 0;
var rainbow_color;

var rainbow_enabled = false;
var rainbow_delay = 50;

var _r = 0, _g = 0, _b = 0;

var last_minute = -1;

var strip = {
	setPixelColor: function(i, c) {
		$('#c'+i).css('color', c);
	},
	Color: function(r, g, b) {
		return 'rgb('+r+','+g+','+b+')';
	}
}


// Mimics Arduino setup() function
function setup() {
	blackOut();

	// This is not for the Arduino
	window.setTimeout(loop, 1);
	window.setTimeout(applyRainbow, 1);
}


// Mimics Arduino loop() function
function loop() {
	ticktock();

	// This is not for the Arduino
	window.setTimeout(loop, 1);
}


function ticktock() {
	var d = new Date();

	// Round the minute to the nearest 5-minute interval
	var minute = 5 * Math.round((d.getMinutes()+d.getSeconds()/60)/5);

	if(minute==last_minute)
		return;

	blackOut();

	// Default words
	doWord("IT");
	doWord("IS");
	doWord("O'CLOCK");

	last_minute = minute;


	// Determine TO / PAST
	if(minute>30 && minute!=0)
		doWord("TO");
	else if(minute<=30 && minute!=0)
		doWord("PAST");


	// Setting this flag will show "MINUTES"
	var showMinutes = true;


	// Determine which word to light up for the minutes
	switch(minute) {
		case 0:
			showMinutes = false;
			break;
		case 5:
		case 55:
			doWord("FIVE");
			break;
		case 10:
		case 50:
			doWord("TEN");
			break;
		case 15:
		case 45:
			doWord("FIFTEEN");
			break;
		case 20:
		case 40:
			doWord("TWENTY");
			break;
		case 25:
		case 35:
			doWord("TWENTY");
			doWord("FIVE");
			break;
		case 30:
			doWord("HALF");
			showMinutes = false;
			break;
	}

	// Show "MINUTES"
	if(showMinutes)
		doWord("MINUTES");


	// The hour
	var hour = d.getHours();

	// Convert to 12-hour format
	if(hour>12)
		hour -= 12;

	// Do we need to increment the hour for "TO"
	if(minute>30)
		hour++;

	// Fix for 13 o'clock
	if(hour==13)
		hour = 1;


	switch(hour) {
		case 1:
			doWord("ONE");
			break;
		case 2:
			doWord("TWO");
			break;
		case 3:
			doWord("THREE");
			break;
		case 4:
			doWord("FOUR");
			break;
		case 5:
			doWord("FIVE", true);
			break;
		case 6:
			doWord("SIX");
			break;
		case 7:
			doWord("SEVEN");
			break;
		case 8:
			doWord("EIGHT");
			break;
		case 9:
			doWord("NINE");
			break;
		case 10:
			doWord("TEN", true);
			break;
		case 11:
			doWord("ELEVEN");
			break;
		case 12:
			doWord("TWELVE");
	}
}


function blackOut() {
	for(var i=0; i<ROWS*COLS; i++) {
		strip.setPixelColor(i, strip.Color(51, 51, 51));
		pixels[i] = 0;
	}
}


function applyRainbow() {
	if(!rainbow_enabled) {
		window.setTimeout(applyRainbow, rainbow_delay);
		return;
	}

	rainbow_color = (Wheel(rainbow_j));
	rainbow_j++;

	if(rainbow_j>=256)
		rainbow_j = 0;

	for(var i=0; i<ROWS*COLS; i++)
		if(pixels[i]==1)
			strip.setPixelColor(i, strip.Color(rainbow_color[0], rainbow_color[1], rainbow_color[2]));

	window.setTimeout(applyRainbow, rainbow_delay);
}


function xyToPixel(x, y) {
	var pixel;

	if(y%2==0) {
		pixel = y * ROWS + x + 1;
	} else {
		pixel = y * ROWS + COLS - x;
	}

	pixel = (ROWS*COLS)-pixel;

	return pixel;
}


function doWord(word, skip) {
	if(skip==undefined) skip = false;

	word = word.toUpperCase();

	if(!skip) {
		var y = Math.floor(chars.indexOf(word)/COLS);
		var x = chars.indexOf(word)-y*COLS;
	} else {
		var y = Math.floor(chars.lastIndexOf(word)/COLS);
		var x = chars.lastIndexOf(word)-y*COLS;
	}

	for(i=x; i<x+word.length; i++) {
		pixels[xyToPixel(i, y)] = 1;
		strip.setPixelColor(xyToPixel(i, y), strip.Color(_r, _g, _b));
	}
}


// Input a value 0 to 255 to get a color value.
// The colours are a transition r - g - b - back to r.
function Wheel(WheelPos) {
    if(WheelPos < 85) {
        return [WheelPos * 3, 255 - WheelPos * 3, 0];
    } else if(WheelPos < 170) {
        WheelPos -= 85;
        return [255 - WheelPos * 3, 0, WheelPos * 3];
    } else {
        WheelPos -= 170;
        return [0, WheelPos * 3, 255 - WheelPos * 3];
    }
}


function random_letter() {
	var n = Math.floor((Math.random() * 26)) + 65;
	return String.fromCharCode(n);
}
