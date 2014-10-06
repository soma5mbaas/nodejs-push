
var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;

module.exports = ApnsProvider;

function ApnsProvider( pushSettings ) {
	this._initPushConnection(pushSettings.apns);
};

inherits(ApnsProvider, EventEmitter);

ApnsProvider.prototype._initPushConnection = function( settings ) {

};

ApnsProvider.prototype.pushNotification = function( notification, deviceToken ) {

};