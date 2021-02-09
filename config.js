var config = {
	dma: 10,
	brightness: 255,
	gpio: 18,
	type: 'grb',
	width: 11,
	height: 11,
	debug: false,
	mdns_ttl: 1,
	chars: `
IT.IS.HALF.
TEN.FIFTEEN
TWENTY.FIVE
MINUTES.TO.
.PAST.EIGHT
..TENINE...
.THREELEVEN
SEVEN.FOUR.
..TWELVE...
FIVE..TWONE
SIX.O'CLOCK
`.trim()
};

if(typeof config.rows!='undefined' && typeof config.cols!='undefined')
	config.leds = config.rows*config.cols;

module.exports = config;
