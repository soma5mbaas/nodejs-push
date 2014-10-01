

var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;
var NodeCache = require('node-cache');
var providers = require('../providers');

module.exports = PushManager;

function PushManager(settings) {
	this.settings = settings || {};

	this.providerCache = new NodeCache( { stdTTL: 600, checkperiod: 620 } );
};

inherits( PushManager, EventEmitter );

PushManager.prototype.getProvider = function(appid, deviceType) {
	var self = this;

	var cacheKey = self.providerCacheKey(appid, deviceType);
	var provider = self.providerCache.get( cacheKey );

	if( !provider ) {
		provider = self.createProvider(appid, deviceType);

		self.providerCache.set( cacheKey, provider );
	}

	return provider;
};

PushManager.prototype.providerCacheKey = function( appid, deviceType ) {
	return appid + ':' + deviceType;
};

PushManager.prototype.createProvider = function( deviceType, pushSettings ) {
	var ProviderClass = providers[deviceType];
	if( !ProviderClass ) { return console.log('지원하지 않는 타입'); }

	var provider = new ProviderClass( pushSettings );

	return provider;
};

PushManager.prototype.notify = function( installation, notification, callback ) {
	var self = this;
	var appid = installation.appid;
	var deviceType = installation.deviceType;

	var provider = self.getProvider(appid, deviceType);


};





//test
var settings = {
	gcm: {
		serverApiKey: 'AIzaSyC9Q1jASJfaM-cBmu-5s1Rq8h-KAZnUInw'
	}
	apns: {

	}
	mqtt: {

	},
	deviceMapping: {
		ios: 'apns',	
		android: 'gcm'
	}
};

var installation = {
	appid: 'appid',
	deviceToken: [],
	deviceType: 'android'
};

installation.deviceToken.push('APA91bFNB_T1ZATk-MD2b_e97ZJ5bSzOTVhQoLlpLvfdVHQjIhysTqkAGgGeENTluwr9qICcmligGKDrpx-MJnLTr5xGftnd2Sgv9rxnzgKkwWE-T1Jhd8xzpJUd4vYf49cCyUOty1WYrMSaSe6ZOCMphxX5wuoSnA');


var notification = {
	collapseKey: 'demo',
	delayWhileIdle: true,
	timeToLive: 3000,
	data: {
		key1: 'message1',
		msg: 'message2'
	}
};



var pushmanager = new PushManager(settings);
pushmanager.notify( installation, notification, callback );
