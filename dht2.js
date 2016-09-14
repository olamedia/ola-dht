#!/usr/bin/node
"use strict";

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


class protocol{
	sendEvent(connection, event){
	
	}
	receiveEvent(connection, event){
		
	}
	receive(connection, data){
		
	}
	send(connection, data){
	
	}
}

class peerConnection{
	constructor(local, remote, transport, socket){
		var self = this;
		self.local = local; // local peer
		self.isServer = false; // local is server
		self.remote = remote; // remote peer info
	}
	attachDataHandler(){
		var self = this;
		var protocol = self.local.protocol;
		self.socket.on('data', (data) => {
			protocol.receive(self, data);
		});
	}
	attachHandlers(){
		var self = this;
		var protocol = self.local.protocol;
		//protocol.receiveEvent(self, 'connection');
		self.remote.socket.on('close', () => {
			
		});
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
	listen(resolve, reject){
		var localPeer = this;
		for (var k in localPeer.transports){
			self.transports[k].listen(localPeer, resolve, reject);
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
	listen(localPeer, resolve, reject){
		var transport = this;
		var server = new net.Server({}); // events: close, connection, error, listening
		server.on('connection', (socket) => {
			console.log('incoming connection');
			
			remotePeer = new peerInfo(socket.remoteAddress, socket.remotePort);
			var connection = new peerConnection(localPeer, remotePeer, transport, socket);
			socket.on('data', (data) => {
				connection.receive(data);
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
			console.log('tcpTransport Listening at ' + self.port);
			//self.local = new peerInfo(host, server.address().port);
			!resolve || resolve();
		});
	}
	dial(localPeer, remotePeer, resolve, reject){
		var transport = this;
		try{
			var socket = new net.Socket({});
			socket.setEncoding('utf8');
			//remotePeer.socket = socket;
			var connection = new peerConnection(localPeer, remotePeer, transport, socket);
			socket.on('data', (data) => {
				connection.receive(data);
			});
			//connection.attachHandlers();
			
			
			
			var isResolved = false;
			remoteTransport.tcpSocket.on('close', () => {
				remoteTransport.tcpSocket = null;
				if (isResolved){
					remoteTransport.peer.emit('close', {});
				}else{
					reject();
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
				remoteTransport._peer.trigger({
					name: 'connected',
					host: remoteTransport.tcpSocket.remoteAddress,
					family: remoteTransport.tcpSocket.remoteFamily,
					port: remoteTransport.tcpSocket.remotePort,
				});
				isResolved = true;
				remoteTransport.host = remoteTransport.tcpSocket.remoteAddress
				remoteTransport.tcpSocket.unref(); // let exit even if connected
				resolve(remoteTransport);
			});
		}catch(e){
			console.trace(e);
		}
	}
}







var node = new peer();
var tcp = new tcpTransport();
//if (port){
//	tcp.port = port;
//}
node.addTransport(tcp);
node.listen();


















