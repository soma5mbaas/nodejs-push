

var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;
var NodeCache = require('node-cache');
var isEmptyObject = require('haru-nodejs-util').common.isEmptyObject;
var providers = require('../providers');

module.exports = PushManager;

function PushManager(settings) {
	this.settings = settings || {};

	this.providerCache = new NodeCache( { stdTTL: 600, checkperiod: 620 } );
};

inherits( PushManager, EventEmitter );

PushManager.prototype.getProvider = function(appid, pushType) {
	var self = this;

	var cacheKey = self.providerCacheKey(appid, pushType);
	var provider = self.providerCache.get( cacheKey );

	// provider가 없으면 새로 만든다.
	if( isEmptyObject(provider) ) {
		// var pushSettings = mongodb.fin({}); pushSetting 정보를 DB에서 얻어오도록 수정해야한다.
		
		var pushSettings = {
			apns: {},
			gcm: { 
				serverApiKey: 'AIzaSyC9Q1jASJfaM-cBmu-5s1Rq8h-KAZnUInw' 
			},
			mqtt: {
				host: 'stage.haru.io',
				port: 1884
			}
		};

		provider = self.createProvider(pushType, pushSettings);
		provider.on('error', function(error) {

		});
		self.providerCache.set( cacheKey, provider );

	} else {
		provider = provider[cacheKey];
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

PushManager.prototype.notify = function( appid, deviceType, notification, deviceToken, callback ) {
	var provider = this.getProvider(appid, deviceType);

	provider.pushNotification(notification, deviceToken);

	if( typeof callback === 'function') callback();
};

