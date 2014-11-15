var async = require('async');

var keys = require('haru-nodejs-util').keys;
var store = require('haru-nodejs-store');

var PushManager = require('../utils/pushManager');

var pushManger = new PushManager({});

var InstallationsClass = 'Installations';
var UsersClass = 'Users';


exports.pushNotification = function(options, notification, callback) {
	var userCollection = keys.collectionKey(UsersClass, options.applicationId);
	//{ applicationId: 'appid',
	//	api: { id: 'restid', type: 'rest' },
	//	timestamp: 1415620106059,
	//		channels: [],
	//	where: { installations: {}, users: { password: 'test' } },
	//	page: { pageSize: 10000, pageNumber: 1 } }

    async.waterfall([
        function queryUsers(callback){
			if( options.where.users ) {
				store.get('mongodb').pagination( userCollection , options.where.users, options.page, function(error, results) {
					callback(null , results);
				});
			} else {
				callback(null , null);
			}
        },
		function queryInstallations(userList, callback) {
			if(userList) {
				var userIds = [];
				for(var i = 0; i < userList.length; i++) {
					userIds.push(userList[i]._id);
				}
				options.where.installations['userId'] = {$in: userIds};
			}

			store.get('mongodb').find( keys.collectionKey(InstallationsClass, options.applicationId) , options.where.installations, function(error, results) {
				callback(null , results);
			});
		},
        function sendPush(installations, callback) {
			var providers = {
				gcm: [],
				ios: [],
				mqtt: []
			};

			for(var i = 0; i < installations.length; i++) {
				var installation = installations[i];
				var type = installation.pushType;

				if( providers[type] ) {
					providers[type].push(options.applicationId+':'+installation.deviceToken);
				} else if( installation.deviceType === 'android' ) {
					providers.gcm.push(installation.deviceToken);
				} else if( installation.deviceType === 'ios' ) {
					providers.apnspush(installation.deviceToken);
 				}
			}

			var providerKeys = Object.keys(providers);

			async.times(providerKeys.length, function(n, next) {
			    var pushType = providerKeys[n];

				if( providers[pushType].length > 0){
					pushManger.notify( options.applicationId, pushType, notification, providers[pushType], function() {
						next( null,  providers[pushType].length);
					});
				} else {
					next(null, 0);
				}
			},function done(error, results) {
				callback(null, results);
			});

        }
    ], function done(error, results) {
		var total = 0;
		for( var i = 0; i < results.length; i++) {
			total += results[i];
		}

        callback(error, total);
    });
};
