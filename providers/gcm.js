
var gcm = require('node-gcm');
var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;

module.exports = GcmProvider;

function GcmProvider( pushSettings ) {
	this._initPushConnection(pushSettings.gcm);
};

inherits(GcmProvider, EventEmitter);

GcmProvider.prototype._initPushConnection = function(settings) {
	console.log('Using GCM Server API key %j\n', settings.serverApiKey);
	this.connection = new gcm.Sender(settings.serverApiKey);
};

GcmProvider.prototype.pushNotification = function( notification, deviceToken ) {
	var self = this;

	var registrationIds = (typeof deviceToken == 'string') ? [deviceToken] : deviceToken;
	var message = this._createMessage(notification);

	console.log('Sending message to %j: %j\n', registrationIds, message);
	self.connection.send( message, registrationIds, 3, function(error, results){
		if( !error && results && results.failure ) {
			var code = results.results && results.results[0] && results.results[0].error;

			if ( code === 'NotRegistered' || code === 'InvalidRegistration' ) {
				console.log('Device %j is no longer registered.\n', deviceToken);
				self.emit('deviceGone', registrationIds);

				return;
			}

			error = new Error('GCM error' + (code || 'Unknown'));
		}

		if(error) {
			console.log('Cannot send message : %s\n', error.stack);
			self.emit('error', error);
			return;
		}

		console.log('GCM results : %s\n', results);
	});

};

GcmProvider.prototype._createMessage = function( notification ) {
	var message = new gcm.Message({
		timeToLive: notification.timeToLive || 3000,
		collapseKey: notification.collapseKey || 'demoe',
		delayWhileIdle: notification.delayWhileIdle || true
	});

	Object.keys( notification ).forEach(function(key) {
		if( notification[key] ) {
			message.addData( key, notification[key] );
		}
	});

	return message;
};