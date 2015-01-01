var mqtt = require('mqtt');
var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;

module.exports = MqttProvider;

function MqttProvider( pushSetting ) {
	var self = this;

	self._initPushConnection(pushSetting);
};

inherits(MqttProvider, EventEmitter);

MqttProvider.prototype._initPushConnection = function( settings ) {
	var self = this;
	settings.options = settings.options || {qos:2, retain: true};
	settings.port = settings.port || 80;
	settings.host = settings.host || 'push.haru.io';
	settings.reconnectPeriod = 100;

	this.connection = mqtt.createClient( settings.port, settings.host, settings.options );
	this.connection.on('error', function(error) {
		self.emit('error', error);
	});
};


MqttProvider.prototype.pushNotification = function( notification, deviceToken, appId ) {
	var connection = this.connection;

	connection.publish(  appId+'/'+deviceToken , JSON.stringify(notification) );
};

MqttProvider.prototype._createMessage = function( notification ) {
	var message = {};
	
	return message;
};