// Local packages
var Config = require('./config');
var WordClock = require('./wordclock');
var MDNS = require('./mdns');
var Web = require('./web');

// Output our config to the terminal
console.log('CONFIG', Config);

// Start the word clock
WordClock.start();

// Listen for MDNS
MDNS.start();

// Listen for web requests
Web.start(WordClock);
