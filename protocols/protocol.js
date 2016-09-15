

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
			//connection.sendEvent(eventName, eventData); // ?? not really required
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

module.exports = protocol;



