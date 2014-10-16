var mongodb = require('mongodb').MongoClient;
var slaves = require('../config').database.mongodb.slaves;
var async = require('async');

var MAX_SLAVE_COUNTER = 100000000;

function MongoDB() {
	this.slaveConnectors = [];
	this.slaveCounter = 0;

	this.connect();
};

MongoDB.prototype.connect = function() {
	var self = this;

	async.timesSeries(slaves.length, function(n, next) {
		mongodb.connect(slaves[n].url, function(error, connection) {
			next(error, connection);
		});
	}, function done(error, connections) {
		self.slaveConnectors = connections;
	});
};

MongoDB.prototype.getConnection = function() {
	var self = this;

	var index = 0;

	return self.slaveConnectors[ index ];
};

MongoDB.prototype.find = function(collection, condition, callback) {
	var self = this;

	process.nextTick(function() {
		var coll = self.getConnection().collection( collection );
		condition = condition || {};

		coll.find( condition ).toArray(function(error, items) {
			return callback(error, items);
		});
	});
};

MongoDB.prototype.findOne = function(collection, condition, callback) {
	var self = this;
	
	process.nextTick(function() {
		var coll = self.getConnection().collection( collection );
		condition = condition || {};

		coll.findOne( condition ,function(error, result) {
			return callback(error, result);
		});
	});
};

module.exports = new MongoDB();