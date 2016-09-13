#!/usr/bin/node


"use strict";

class peerInfo{
	toString(){
		var peer = this;
		return peer.host + '/' + this.allTransports().join(';');
	}
	allTransports(){
		var ta = [];
		for (var k in this.transports){
			 var a = this.transports[k];
			 for (var i = 0; i < a.length; i++){
			 	var transport = a[i];
			 	ta.push(transport);
			}
		}
		return ta;
	}
	constructor(){ 
		this.transports = {}
		this.dialed = false;
	}
	listen(resolve, reject){
		var total = this.allTransports().length;
		var resolved = 0;
		var rejected = 0;
		for (var k in this.transports){
			 var a = this.transports[k];
			 for (var i = 0; i < a.length; i++){
			 	var transport = a[i];
			 	transport.listen(() => {
			 		resolved++;
			 		if (total === resolved){
			 			resolve();
			 		}
			 	}, () => {
			 		rejected++;
			 		if (total === rejected){
			 			reject();
			 		}
			 	});
			 }
		}
		
	}
	send(data, resolve, reject){
		var peer = this;
		peer.ensureDialed(() => {
			console.log('remoteTransport', peer._dialTransport.toString());
			peer._dialTransport.send(data, resolve, reject);
		}, reject);
	}
	ensureDialed(resolve, reject){
		var peer = this;
		if (!peer.dialed){
			return peer.dial((remoteTransport) => {
				peer.dialed = true;
				peer._dialTransport = remoteTransport;
				!resolve || resolve();
			}, reject);
		}
		!resolve || resolve();
	}
	dial(resolve, reject){
		for (var k in this.transports){
			this.dialTransport(k, resolve, reject);
			break;
		}
	}
	dialTransport(transportName, resolve, reject){
		var remote = this.transports[transportName][0];
		//console.log('dialTransport remote', remote);
		remote.dial((remote) => {
			console.log('dialed remote', remote.port);
			!resolve || resolve(remote);
		}, () => {
			console.log('dialTransport reject()');
			!reject || reject();
		});
	}
	emit(event){
		
	}
}

class peerUtil{
	static addTransport(peer, transport, resolve, reject){
		if (!(transport.name in peer.transports)){
			peer.transports[transport.name] = [];
		}
		transport.attach(peer);
		peer.transports[transport.name].push(transport);
		return resolve?resolve():null;
	}
}

const merge = () => {
	var result = {};
	for (var i = 0; i < arguments.length; i++){
		var arg = arguments[i];
		if (typeof {} === typeof arg){
			for (var k in arg){
				result[k] = arg[k];
			}
		}
	}
	return result;
};

const net = require('net');

class peerTransport{
	// port: Port the client should connect to (Required).
	constructor(name, options){ 
		this.name = name;
		// net.isIPv4 net.isIPv6
		this.options = merge({
		//	host: 'localhost'
		}, options);
		this._peer = null;
	}
	listen(resolve, reject){
		// abstract
	}
	set port(port){
		this.options.port = port;
	}
	get port(){
		return this.options.port;
	}
	set host(host){
		this._peer.host = host;
	}
	get host(){
		return this._peer.host;
	}
	get family(){
		if (net.isIPv6(this.host)){
			return 6;
		}
		return 4;
	}
	attach(peer){
		this._peer = peer;
	}
	detach(){
		this._peer = null;
	}
}

class rawData{
	constructor(host, family, port, data){
		this.host = host;
		this.family = family;
		this.port = port;
		this.data = data;
	}
}

class tcpTransport extends peerTransport{
	toString(){
		return 'tcp:' + this.port;
	}
	constructor(options){
		super('tcp', options);
	}
	listen(resolve, reject){
		this.tcpServer = new net.Server({});
		this.tcpServer.on('connection', (socket) => {
			
			console.log('incoming connection');
			
			var host = socket.remoteAddress;
			var port = socket.remotePort;
			
			socket.on('data', (data) => {
				var raw = new rawData(socket.remoteAddress, socket.remoteFamily, socket.remotePort, data); // FIXME: push data into listener
				console.log('incoming data', raw);
			});
		});

		this.tcpServer.listen({
			port: 0//transport.port
		}, () => {
			this.port = this.tcpServer.address().port;
			console.log('tcpTransport Listening at ' + this.port);
			!resolve || resolve();
		});
	}
	dial(resolve, reject){
		try{
			var remoteTransport = this;
			remoteTransport.tcpSocket = new net.Socket({});
			remoteTransport.tcpSocket.setEncoding('utf8');
			var isResolved = false;
			remoteTransport.tcpSocket.on('close', () => {
				remoteTransport.tcpSocket = null;
				if (isResolved){
					remoteTransport.peer.emit('close', {});
				}else{
					reject();
				}
			});
			remoteTransport.tcpSocket.on('data', () => {
				console.log('remote data');
				remoteTransport.peer.emit('data', {
					// data: 
				});
			});
			remoteTransport.tcpSocket.connect({
				port: remoteTransport.port, //Port the client should connect to (Required).
				host: remoteTransport.host, //Host the client should connect to. Defaults to 'localhost'.
				//localAddress: //Local interface to bind to for network connections.
				//localPort: //Local port to bind to for network connections.
				family: remoteTransport.family //Version of IP stack. Defaults to 4.
				//hints: //dns.lookup() hints. Defaults to 0.
				//lookup: //Custom lookup function. Defaults to dns.lookup.
			}, () => {
				isResolved = true;
				remoteTransport.host = remoteTransport.tcpSocket.remoteAddress
				remoteTransport.tcpSocket.unref(); // let exit even if connected
				resolve(remoteTransport);
			});
		}catch(e){
			console.trace(e);
		}
	}
	isDialed(){
		var remoteTransport = this;
		return ('tcpSocket' in remoteTransport) && (null !== remoteTransport.tcpSocket);
	}
	ensureDialed(resolve, reject){
		var remoteTransport = this;
		if (!remoteTransport.isDialed()){
			return remoteTransport.dial(resolve, reject);
		}
		resolve();
	}
	send(data, resolve, reject){
		var remoteTransport = this;
		remoteTransport.ensureDialed(() => {
			console.log('send -> ensureDialed resolved');
			remoteTransport.tcpSocket.write(data, 'utf-8', () => {
				console.log('send -> ensureDialed resolved -> sent data', data);
				!resolve || resolve();
			});
		}, () => {
			!reject || reject();
		});
	}
}

class transportNode{
	constructor(){
		this,peer = new peerInfo();
		peerUtil.addTransport(this,peer, new tcpTransport());
	}
	listen(resolve, reject){
		this.peer.listen(resolve, reject);
	}
}


class peerProtocol{
	
}

class routingProtocol extends peerProtocol{
	
}


// NODE 1
var localPeer = new peerInfo();
var node1Peer = localPeer;
peerUtil.addTransport(localPeer, new tcpTransport());
peerUtil.addTransport(localPeer, new tcpTransport());
localPeer.listen(function(){

	// NODE 2
	var remotePeer = node1Peer;
	console.log('remotePeer', remotePeer.toString());
	var localPeer = new peerInfo();
	peerUtil.addTransport(localPeer, new tcpTransport());
	remotePeer.send(JSON.stringify({
		data: 'boo!'
	}), () => {
		console.log('remotePeer', remotePeer.toString());
	});
});










