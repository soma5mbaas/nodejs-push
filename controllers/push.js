
var pushHandelr = require('../handlers/push');
var getHeader = require('haru-nodejs-util').common.getHeader;

exports.push = function(req, res) {
	var options = getHeader(req);
	var notification = req.body.notification || {};

	options.channels = req.body.channels || [];
	options.where = req.body.where || {};

	pushHandelr.pushNotification(options, notification, function(error, results) {
		if( error ) return res.json(error, results);

		res.json(results);
	});
};