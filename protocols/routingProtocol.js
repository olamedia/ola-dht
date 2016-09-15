

const protocol = require(__dirname + '/protocol.js');
const encryptionProtocol = require(__dirname + '/encryptionProtocol.js');


class routingProtocol extends protocol{
	constructor(){
		super();
		var self = this;
		self.setLowProto(new encryptionProtocol());
	}
	receiveEvent(connection, eventName, eventData){
		var self = this;
		console.log('routingProtocol.receiveEvent(',eventName,')');
	}
}

module.exports = routingProtocol;




