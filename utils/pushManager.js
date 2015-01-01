var _ = require('underscore');

var async = require('async');
var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;
var NodeCache = require('node-cache');
var isEmptyObject = require('haru-nodejs-util').common.isEmptyObject;
var Providers = require('../providers');

var keys = require('haru-nodejs-util').keys;
var store = require('haru-nodejs-store');

var InstallationsClass = 'Installations';
var UsersClass = 'Users';


module.exports = PushManager;

function PushManager(settings) {

	this.settings = settings || {};
	this.ttlInSeconds = this.settings.ttlInSeconds || 0;
	this.checkPeriodInSeconds = this.settings.checkPeriodInSeconds || 0;
	this.applicationsCache = new NodeCache({ stdTTL: this.ttlInSeconds, checkperiod: this.checkPeriodInSeconds });
	this.deviceTypeToPusthType = {
		android: 'mqtt',
		ios: 'apns'
	};
};

inherits( PushManager, EventEmitter );

PushManager.prototype.getApplication = function (appId, pushType, cb) {
	var self = this;

	var app = self.applicationsCache.get(appId);
	if( app[appId] && app[appId][pushType] ) {
		return process.nextTick(function() {
			cb(null, app[appId][pushType]);
		});
	}

	_findPushSetting(appId, function(error, pushSettings) {
		if( error ) { return cb(error, pushSettings); }

		if( !app[appId] ) {
			app[appId] = {};
		}

		if( !app[appId][pushType] ) {
			app[appId][pushType] = self.getProvider(pushType, pushSettings);
		}

		self.applicationsCache.set(appId, app[appId]);

		cb(error, app[appId][pushType]);
	});
};

PushManager.prototype.getProvider = function (pushType, pushSettings) {
	var self = this;
	var Provider = Providers[pushType];

	if( !Provider ) { return null; }

	var provider = new Provider(pushSettings[pushType]);

	provider.on('devicesGone', function(deviceTokens) {
		// TODO deviceGone
	});

	provider.on('error', function(err) {
		self.emit('error', err);
	});

	return provider;
};

PushManager.prototype.notifyByQuery = function(options, notification, cb) {
	var self = this;
	_doQuery(options, function(error, installationList) {
		if( error ) { return cb(error); }
		if( installationList === null || installationList.length === 0 ) { return cb(error); }

		async.each(
			installationList,
			function(installation, next) {
				installation.applicationId = options.applicationId;
				self.notify(installation, notification, next);
			},
			function done(error) {
				cb(error);
			}
		);
	});
};


PushManager.prototype.notify = function(installation, notification, cb) {
	if( !(_.isObject(installation) && notification) ) { return cb(new Error('bad arguments'), null);}

	var appId = installation.applicationId;
	var deviceToken = installation.deviceToken;
	var pushType = installation.pushType || this.deviceTypeToPusthType[installation.deviceType];

	this.getApplication(
		appId,
		pushType,
		function( error, provider ) {
			if ( error ) { return cb(error); }
			if ( !provider ) { return cb(error); }

			provider.pushNotification(notification, deviceToken, appId);
			cb();
		}
	);
};


function _doQuery(options, callback) {
	var condition = {};

	async.series([
		function addUsersCondition(callback){
			if( !options.where.users ) { return callback( null, null ); }

			store.get('mongodb').find(keys.collectionKey(UsersClass, options.applicationId), options.where.users, function(error, users) {
				if( error ) { return callback(error, users); }
				if( users.length === 0 ) { return callback(error, []); }

				var idList = _.map(users, function(user) {
					return user._id;
				});

				condition.userId = { '$in': idList};
				callback(error);
			});
		},
		function addInstallationsCondtion(callback) {
			if( options.where.installations === undefined || _.isEmpty(options.where.installations) ) { return callback (null, null); }

			_.extend(condition, options.where.installations);

			callback(null, null);
		},
		function doQuery(callback) {
			store.get('mongodb').find( keys.collectionKey(InstallationsClass, options.applicationId), condition, callback );
		}
	], function done(error, results) {
		if( error ) { return callback(error, []); }

		callback( error, results[2] );
	});
};

function _findPushSetting(appId, callback) {
	// TODO Select Application Push Settings
	//callback(null, {
	//	mqtt: {},
	//	apns:{
	//		gateway : "gateway.sandbox.push.apple.com",
	//		certData: './keys/cert.pem',
	//		keyData: './keys/key.pem'
	//	},
	//	gcm: {} });

	callback(null, config.pushSettings);
};
