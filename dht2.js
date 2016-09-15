#!/usr/bin/node
"use strict";

const net = require('net');

// remote peer required info:
// host
// port
// transport
// protocol?
// + encryption layer:
// DH keys
// public key
// peer ID (public key hash)
//

class peerConnection{
	constructor(local, remote, transport, socket){
		var self = this;
		self.local = local; // local peer
		self.isServer = false; // local is server
		self.remote = remote; // remote peer info
		self.transport = transport;
		self.socket = socket;
		self.rootProtocol = self.local.protocol.getRoot();
	}
	attachDataHandler(){
		var connection = this;
		//var protocol = self.local.protocol;
		self.socket.on('data', (data) => {
			connection.rootProtocol.receiveData(self, data);
		});
	}
	attachHandlers(){
		var self = this;
		var protocol = self.local.protocol;
		//protocol.receiveEvent(self, 'connection');
		self.remote.socket.on('close', () => {
			
		});
	}
	receiveEvent(eventName, eventData){
		var connection = this;
		//console.log('peerConnection.receiveEvent from', connection.remote);
		//var protocol = connection.local.protocol;
		connection.rootProtocol.receiveEvent(connection, eventName, eventData);
	}
	receiveData(data){
		var connection = this;
		//console.error('peerConnection.receiveData');
		connection.rootProtocol.receiveData(connection, data);
	}
	sendEvent(eventName, eventData){
		// ???? not required
		//var connection = this;
		//connection.transport.sendEvent(data);
	}
	sendData(data){
		var connection = this;
		connection.transport.sendData(connection, data);
	}
}

class peerInfo{
	constructor(host, port){
		var self = this;
		self.host = host;
		self.port = port;
	}
}

class peer extends peerInfo{
	constructor(){
		super(null, 0);
		var localPeer = this;
		localPeer.transports = [];
	}
	addTransport(transport){
		var localPeer = this;
		localPeer.transports.push(transport);
	}
	setProtocol(protocol){
		var localPeer = this;
		localPeer.protocol = protocol;
	}
	listen(resolve, reject){
		var localPeer = this;
		for (var k in localPeer.transports){
			localPeer.transports[k].listen(localPeer, resolve, reject);
		}
	}
}


class tcpTransport{
	constructor(port){
		var self = this;
		self.port = 0;
		if (port){
			self.port = port;
		}
	}
	sendData(connection, data){
		var socket = connection.socket;
		socket.write(data, 'utf-8');
		socket.end();
	}
	listen(localPeer, resolve, reject){
		var transport = this;
		var server = new net.Server({}); // events: close, connection, error, listening
		server.on('connection', (socket) => {
			socket.setEncoding('utf8');
			console.log('incoming connection');
			
			var remotePeer = new peerInfo(socket.remoteAddress, socket.remotePort);
			var connection = new peerConnection(localPeer, remotePeer, transport, socket);
			connection.isServer = true;
			connection.receiveEvent('connection'); // FIXME
			socket.on('data', (data) => {
				connection.receiveData(data);
			});
			//connection.attachDataHandler();
			//connection.attachHandlers();
		});
		server.on('error', (e) => {
			if (e.code == 'EADDRINUSE') {
				console.log('Error: Address in use', transport.port);
			}
			throw e;
		});
		server.listen({
			port: transport.port
		}, () => {
			transport.port = server.address().port;
			console.log('tcpTransport Listening at ' + transport.port);
			//self.local = new peerInfo(host, server.address().port);
			!resolve || resolve();
		});
	}
	dial(localPeer, remotePeer, resolve, reject){
		var transport = this;
		try{
			var socket = new net.Socket({}); // events: close, connect, data, drain, end, error, lookup, timeout
			socket.setEncoding('utf8');
			//remotePeer.socket = socket;
			var connection = new peerConnection(localPeer, remotePeer, transport, socket);
			socket.on('data', (data) => {
				connection.receiveData(data);
			});
			var isResolved = false;
			socket.on('close', () => {
				if (isResolved){
					connection.receiveEvent('close');
				}else{
					!reject || reject();
				}
			});
			socket.connect({
				host: remotePeer.host,
				port: remotePeer.port,
				//localAddress: //Local interface to bind to for network connections.
				//localPort: //Local port to bind to for network connections.
				//family: remoteTransport.family //Version of IP stack. Defaults to 4.
				//hints: //dns.lookup() hints. Defaults to 0.
				//lookup: //Custom lookup function. Defaults to dns.lookup.
			}, () => {
				isResolved = true;
				connection.receiveEvent('connect'); // FIXME
				!resolve || resolve();
			});
		}catch(e){
			console.trace(e);
		}
	}
}


module.exports = {
	peerInfo: peerInfo,
	peer: peer,
	tcpTransport: tcpTransport,
	//dhtProtocol: dhtProtocol
};




/*var node = new peer();
var tcp = new tcpTransport();
//if (port){
//	tcp.port = port;
//}
node.addTransport(tcp);

var dht = new dhtProtocol();
node.setProtocol(dht);
node.listen();

console.dir(node);*/
// var remotePeer = new peerInfo('127.0.0.1', 8080);
// tcp.dial(node, remotePeer, () => { console.log('connected') });
















