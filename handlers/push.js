
var mongodb = require('../connectors/mongodb');
var pushConnector = require('../utils/pushConnector');
var util = require('../utils/util');
var async = require('async');
var keys = require('../utils/keys');

exports.pushNotification = function(options, data, callback) {

	var done = function( error, results ) {
		return callback(error, results);
	};

	async.waterfall([
		function findDeviceTokens(callback) {
			var key = keys.collectionKey('Installation', options.applicationId);
			console.log(key);

			var returenDeviceToken = function(error, results) {
				// var deviceTokens = results.map(function(entity) {
				// 	return entity.deviceTokens;
				// });

				// return callback(error, deviceTokens);
				console.log(results);
			};

			if( !util.isEmptyObject(options.where) ) {
				// do query 
				mongodb.find(key, options.where, returenDeviceToken);
			} else if( !util.isEmptyObject(options.channels) ) {
				//do query Channels
				var condition = { channels: {"$in": options.channels} };

				mongodb.find(key, condition, returenDeviceToken);
			}
		},
		function push(deviceTokens, callback) {

		}
		], done);
};
