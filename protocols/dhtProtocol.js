

const protocol = require(__dirname + '/protocol.js');
const routingProtocol = require(__dirname + '/routingProtocol.js');


class dhtProtocol extends protocol{
	constructor(){
		super();
		var self = this;
		self.setLowProto(new routingProtocol());
	}
	receiveEvent(connection, eventName, eventData){
		var self = this;
		console.log('dhtProtocol.receiveEvent(', eventName,')');
		// self._receiveEvent(connection, eventName, eventData);
	}
	receiveData(connection, data){
		var self = this;
		console.log('dhtProtocol.receiveData', data);
		
	}
}

module.exports = dhtProtocol;




