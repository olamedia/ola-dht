#!/usr/bin/node

const peerInfo = require('./dht2.js').peerInfo;
const peer = require('./dht2.js').peer;
const tcpTransport = require('./dht2.js').tcpTransport;
const dhtProtocol = require('./protocols/dhtProtocol.js');


var argv = require('yargs')
	.alias('p', 'port').string('p').describe('p', 'Port.').default('p', 8080)
	.usage('Usage: $0 -p 8080')
	.demand(['p'])
	.argv;
var port = parseInt(argv.p, 10);
console.log('Starting at port', port);

var node = new peer();

var tcp = new tcpTransport();
tcp.port = port;
node.addTransport(tcp);

var dht = new dhtProtocol();
node.setProtocol(dht);

node.listen(function(){
	console.log('[NODE] ready');
});

console.dir(node);




