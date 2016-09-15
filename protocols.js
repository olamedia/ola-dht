#!/usr/bin/node
"use strict";

const net = require('net');
const crypto = require('crypto');



class protocol{
	constructor(){
		var self = this;
		self.lowProto = null;
		self.highProto = [];
		
		// Lowest:
		// lowProto: null
		// highProto: [proto]
		
		// Highest:
		// lowProto: proto
		// highProto: null
	}
	getRoot(){
		var self = this;
		if (null !== self.lowProto){
			return self.lowProto.getRoot();
		}
		return self;
	}
	setLowProto(protocol){
		var self = this;
		self.lowProto = protocol;
		protocol.highProto.push(self);
	}
	_receiveEvent(connection, eventName, eventData){
		var self = this;
		for (var k in self.highProto){
			self.highProto[k].receiveEvent(connection, eventName, eventData);
		}
	}
	receiveEvent(connection, eventName, eventData){
		var self = this;
		self._receiveEvent(connection, eventName, eventData);
	}
	_sendEvent(connection, eventName, eventData){
		var self = this;
		if (null !== self.lowProto){
			self.lowProto.sendEvent(connection, eventName, eventData);
		}else{
			connection.sendEvent(eventName, eventData); // ?? not really required
		}
	}
	sendEvent(connection, eventName, eventData){
		var self = this;
		self._sendEvent(connection, eventName, eventData);
	}
	_receiveData(connection, data){
		var self = this;
		for (var k in self.highProto){
			self.highProto[k].receiveData(connection, data);
		}
	}
	receiveData(connection, data){
		var self = this;
		self._receiveData(connection, data);
	}
	_sendData(connection, data){
		var self = this;
		if (null !== self.lowProto){
			self.lowProto.sendData(connection, data);
		}else{
			connection.sendData(data);
		}
	}
	sendData(connection, data){
		var self = this;
		self._sendData(connection, data);
	}
}

class encryptionProtocol extends protocol{
	constructor(){
		super();
		var self = this;
		//self.lowProto = ? // connection
	}
	receiveEvent(connection, eventName, eventData){
		var self = this;
		console.log('encryptionProtocol.receiveEvent(',eventName,')');
		if ('connect' === eventName || 'connection' === eventName){
			//connection.remoteDH = null;
			connection.ecdhReady = false;
			connection.ecdh = crypto.createECDH('secp521r1');
			connection.ecdh.generateKeys();
			//connection.ecdhKey = connection.ecdh.getPublicKey('hex');
			self._sendData(connection, connection.ecdh.getPublicKey(null, 'compressed').toString('binary'));
		}
		self._receiveEvent(connection, eventName, eventData);
	}
	receiveData(connection, data){
		var self = this;
		if (!connection.ecdhReady){
			var secret = connection.ecdh.computeSecret(data, 'binary', 'hex');
			// While the shared secret may be used directly as a key, it is often desirable to hash the secret to remove weak bits due to the Diffie–Hellman exchange.
			
			console.log("[SECRET]", secret, ' <= ', data);
			return;
		}
		var decodedData = data; //f(data);
		self._receiveData(connection, decodedData);
	}
	sendData(connection, data){
		var self = this;
		var encodedData = data;// = f(data);
		self._sendData(connection, encodedData);
	}
}

class routingProtocol extends protocol{
	constructor(){
		super();
		var self = this;
		self.setLowProto(new encryptionProtocol());
	}
}

class dhtProtocol extends protocol{
	constructor(){
		super();
		var self = this;
		self.setLowProto(new routingProtocol());
	}
	receiveEvent(connection, eventName, eventData){
		var self = this;
		console.log('dhtProtocol.receiveEvent', eventName);
		// self._receiveEvent(connection, eventName, eventData);
	}
	receiveData(connection, data){
		var self = this;
		console.log('dhtProtocol.receiveData', data);
		
	}
}



module.exports = {
	dhtProtocol: dhtProtocol
};


