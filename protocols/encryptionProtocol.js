

const crypto = require('crypto');
const protocol = require(__dirname + '/protocol.js');

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
			return;
		}
		self._receiveEvent(connection, eventName, eventData);
	}
	receiveData(connection, data){
		var self = this;
		if (!connection.ecdhReady){
			var secret = connection.ecdh.computeSecret(data, 'binary', 'hex');
			// While the shared secret may be used directly as a key, it is often desirable to hash the secret to remove weak bits due to the Diffie–Hellman exchange.
			
			console.log("[SECRET]", secret, ' <= ', data);
			self._receiveEvent(connection, connection.isServer?'connection':'connect');
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

module.exports = encryptionProtocol;




