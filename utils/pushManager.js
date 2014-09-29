

var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;

module.exports = PushManager;

function PushManager() {

};

inherits( PushManager, EventEmitter );

