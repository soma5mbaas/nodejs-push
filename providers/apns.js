
var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;
var apn = require('apn');

module.exports = ApnsProvider;

function ApnsProvider( pushSettings ) {
	var settings = pushSettings || {};
	var pushOptions = settings.pushOptions || {};
	var feedbackOptions = settings.feedbackOptions || {};

	// Populate the shared cert/key data
	if(settings.certData) {
		pushOptions.cert = pushOptions.certData || settings.certData;
		feedbackOptions.cert = feedbackOptions.certData || settings.certData;
	}
	if(settings.keyData) {
		pushOptions.key = pushOptions.keyData || settings.keyData;
		feedbackOptions.key = feedbackOptions.keyData || settings.keyData;
	}

	// Check the push mode production vs development
	if(settings.production) {
		// Always override
		pushOptions.gateway = 'gateway.push.apple.com';
		feedbackOptions.gateway = 'feedback.push.apple.com';
		if(pushOptions.port !== undefined) {
			pushOptions.port  = 2195;
		}
		if(feedbackOptions.port !== undefined) {
			feedbackOptions.port  = 2196;
		}

	} else {
		// Honor the gateway settings for testing
		pushOptions.gateway = pushOptions.gateway || 'gateway.sandbox.push.apple.com';
		feedbackOptions.gateway = feedbackOptions.gateway || 'feedback.sandbox.push.apple.com';
	}

	// Keep the options for testing verification
	this._pushOptions = pushOptions;
	this._feedbackOptions = feedbackOptions;

	this._setupPushConnection(pushOptions);
	this._setupFeedback(feedbackOptions);
};

inherits(ApnsProvider, EventEmitter);

ApnsProvider.prototype._initPushConnection = function( pushSettings ) {


	this._setupPushConnection(pushOptions);
	this._setupFeedback(feedbackOptions);
};

ApnsProvider.prototype._setupPushConnection = function(options) {
	var self = this;
	if(options && !options.port){
		delete options.port;
	}

	var connection = new apn.Connection(options);

	function errorHandler(err) {
		console.log('Cannot initialize APNS connection. %s', err.stack);
		self.emit('error', err);
	}

	connection.on('error', errorHandler);
	connection.on('socketError', errorHandler);

	connection.on('transmissionError', function(code, notification, recipient) {
		var err = new Error('Cannot send APNS notification: ' + code);
		self.emit(err, notification, recipient);
	});

	this._connection = connection;
};

ApnsProvider.prototype._setupFeedback = function(options) {
	if (!options) {
		console.log('Feedback channel is not enabled in the application settings.');
		return;
	}

	var self = this;
	this._feedback = new apn.Feedback(options);
	this._feedback.on('feedback', function (devices) {
		self.emit('devicesGone', devices);
	});
};

ApnsProvider.prototype.pushNotification = function( notification, deviceToken, appId ) {
	var note = new apn.Notification();

	//note.expiry = notification.getTimeToLiveInSecondsFromNow() || note.expiry;
	note.badge = notification.badge;
	note.sound = notification.sound;
	note.alert = notification.alert;
	note.payload = {};

	Object.keys(notification).forEach(function (key) {
		note.payload[key] = notification[key];
	});

	this._connection.pushNotification(note, deviceToken);
};