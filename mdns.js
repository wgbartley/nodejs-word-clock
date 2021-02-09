// Native modules
var os = require('os');

// NPM packages
var mdns = require('multicast-dns')();
var IP = require('internal-ip');

// Local packages
var Config = require('./config');


// Defined hostnames
var hostnames = [];
function get_hostnames(callback) {
	// Get hostnames from config if available
	if(typeof Config.hostnames!='undefined')
		hostnames = Config.hostnames;

	// Use the OS host name if none are in config
	if(hostnames.length==0)
		hostnames = [os.hostname()];

	// Append .local if need be
	for(var i=0; i<hostnames.length; i++) {
		if(hostnames[i].indexOf('.')<0)
			hostnames[i] += '.local';
	}

	callback();
}


// Detect IP addresses
var ips = {v6:[], v4:[]};
function get_ips(callback) {
	ips.v6 = [];
	ips.v4 = [];

	var ipv6 = IP.v6.sync();
	var ipv4 = IP.v4.sync();

	if(typeof ipv6!='undefined')
		ips.v6.push(ipv6);

	if(typeof ipv4!='undefined')
		ips.v4.push(ipv4);

	callback();
}


// Get our IP address(es)
function query_listen() {
	mdns.on('query', function(query) {
		var questions = query.questions;

		if(!questions)
			return;

		questions.forEach(function(question) {
			var type = question.type;
			var name = question.name;

			if(type!='A')
				return;

			if(hostnames.indexOf(name)<0)
				return;

			var response = [];
			for(var i=0; i<ips.v6.length; i++) {
				response.push({
					name: name,
					type: 'AAAA',
					data: ips.v6[i],
					ttl: Config.mdns_ttl
				});
			}

			for(var i=0; i<ips.v4.length; i++) {
				response.push({
					name: name,
					type: 'A',
					data: ips.v4[i],
					ttl: Config.mdns_ttl
				});
			}

			mdns.respond(response);
		});
	});
}


module.exports.start = function() {
	get_hostnames(function() {
		get_ips(function() {
			query_listen();
			console.log('>>> MDNS listener started');
		});
	});
}
