
module.exports = {
	ios: require('./apns.js'),
	// android: require('./gcm.js'),
	android: require('./mqtt.js')
};