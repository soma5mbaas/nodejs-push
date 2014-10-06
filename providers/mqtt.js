var mqtt = require('mqtt');
var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;



function MqttProvider( pushSettings ) {
	this._initPushConnection(pushSettings.mqtt);
};

module.exports = MqttProvider;
inherits(MqttProvider, EventEmitter);

MqttProvider.prototype._initPushConnection = function( settings ) {
	settings.options = settings.options || {};
	settings.port = settings.port || 1883;
	settings.host = settings.host || 'localhost';

	this.connection = mqtt.createClient( settings.port, settings.host, settings.options );
};

MqttProvider.prototype.pushNotification = function( notification, deviceToken ) {
	var self = this;
	var connection = this.connection;
	
	var registrationIds = (typeof deviceToken == 'string') ? [deviceToken] : deviceToken;
	registrationIds.forEach(function(id){
		connection.publish(id, notification.message);
	});
};

MqttProvider.prototype._createMessage = function( notification ) {
	var message = {};
	
	return message;
};