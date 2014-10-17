
var mongodb = require('../connectors/mongodb');

var async = require('async');

var keys = require('haru-nodejs-util').keys;
var isEmptyObject = require('haru-nodejs-util').common.isEmptyObject;

var PushManager = require('../utils/pushManager');

var pushManger = new PushManager({});

var InstallationsClass = 'Installations';

exports.pushNotification = function(options, notification, callback) {

	var done = function( error, results ) {
		return callback(error, results);
	};

	async.waterfall([
		function findDeviceTokens(callback) {
			var key = keys.collectionKey(InstallationsClass, options.applicationId);
			function returenDeviceToken(error, results) {
				var providers = {
					gcm: [],
					ios: [],
					mqtt: [],
				};

				results.forEach(function(installation) {
					var type = installation.pushType;
                    providers[type].push(installation.deviceToken);
				});

				return callback( error, providers );
			};


			if( !isEmptyObject(options.where) ) {
				mongodb.find(key, options.where, returenDeviceToken);
    
			} else if( !isEmptyObject(options.channels) ) {
				var condition = { channels: {"$in": options.channels} };
				mongodb.find(key, condition, returenDeviceToken);
			}
		},
		function push(providers, callback) {
            console.log(providers);
            
			var keys = Object.keys(providers);
            keys.forEach(function(pushType) {
				if( providers[pushType].length > 0){
					pushManger.notify( options.applicationId, pushType, notification, providers[pushType], function() {

					});
				}
			});

			callback(null, null);
		}
		], done);
};
