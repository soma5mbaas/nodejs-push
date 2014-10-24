
var pushHandelr = require('../handlers/push');
var getHeader = require('haru-nodejs-util').common.getHeader;
var sendError = require('haru-nodejs-util').common.sendError;


exports.push = function(req, res) {
	var options = getHeader(req);
	var notification = req.body.notification || {};
	var output = {};

	options.channels = req.body.channels || [];
	options.where = { installations: req.body.installations || {}, users: req.body.users };

	if( !req.body.installations && !req.body.users ) { return sendError(res, new Error('')); }

	pushHandelr.pushNotification(options, notification, function(error, results) {
		if( error ) { return sendError(res, error); }
		
		res.json({total: results});
	});
};