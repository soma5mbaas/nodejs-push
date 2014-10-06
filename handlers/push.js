
var mongodb = require('../connectors/mongodb');

var async = require('async');

var keys = require('haru-nodejs-util').keys;
var isEmptyObject = require('haru-nodejs-util').common.isEmptyObject;

var PushManager = require('../utils/pushManager');

var pushManger = new PushManager({});

exports.pushNotification = function(options, notification, callback) {

	var done = function( error, results ) {
		return callback(error, results);
	};

	async.waterfall([
		function findDeviceTokens(callback) {
			var key = keys.collectionKey('Installation', options.applicationId);

			function returenDeviceToken(error, results) {
				var deviceGroup = {
					android: [],
					ios: [],
					mqtt: [],
				};

				results.forEach(function(installation) {
					var type = installation.deviceType;
					deviceGroup[type].push(installation.deviceToken);
				});

				return callback( error, deviceGroup );
			};


			if( !isEmptyObject(options.where) ) {
				mongodb.find(key, options.where, returenDeviceToken);

			} else if( !isEmptyObject(options.channels) ) {
				var condition = { channels: {"$in": options.channels} };
				mongodb.find(key, condition, returenDeviceToken);

			}
		},
		function push(deviceTokens, callback) {
			var deviceTypes = Object.keys(deviceTokens);
			deviceTypes.forEach(function(deviceType) {
				if( deviceTokens[deviceType].length > 0){ 
					pushManger.notify( options.applicationId, deviceType, notification, deviceTokens[deviceType], function() {

					});
				}
			});

			callback(null, null);
		}
		], done);
};
