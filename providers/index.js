
module.exports = {
	ios: require('./apns.js'),
	android: require('./gcm.js'),
	mqtt: require('./mqtt.js')
};