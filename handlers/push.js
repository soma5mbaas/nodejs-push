
var mongodb = require('../connectors/mongodb');
var pushConnector = require('../utils/pushConnector');

var async = require('async');

var keys = require('haru-nodejs-util').keys;
var isEmptyObject = require('haru-nodejs-util').isEmptyObject;

exports.pushNotification = function(options, data, callback) {

	var done = function( error, results ) {
		return callback(error, results);
	};

	async.waterfall([
		function findDeviceTokens(callback) {
			var key = keys.collectionKey('Installation', options.applicationId);

			function returenDeviceToken(error, results) {
				
				var providers = {
					android: [],
					ios: [],
					mqtt: [],
				};

				results.forEach(function(installation) {
					var type = installation.deviceType;

					providers[type].push(installation.deviceToken);
				});

				return callback( error, providers );
			};


			if( !isEmptyObject(options.where) ) {
				// do query 
				mongodb.find(key, options.where, returenDeviceToken);
			} else if( !isEmptyObject(options.channels) ) {
				//do query Channels
				var condition = { channels: {"$in": options.channels} };

				mongodb.find(key, condition, returenDeviceToken);
			}
		},
		function push(deviceTokens, callback) {
			// deviceTokens.forEach(function(deviceType) {
			// 	console.log(deviceType +' : ' + deviceTokens[deviceType].length);
			// });
			var deviceTypes = Object.keys(deviceTokens);
			deviceTypes.forEach(function(deviceType) {
				console.log( deviceTokens[deviceType] );
			});

			callback(null, null);
		}
		], done);
};
