var mqtt = require('mqtt')
var client = mqtt.createClient(80, 'push.haru.io');

var request = require('request');
var uid = require('uid2');
var uuid = require('uuid');
var async = require('async');

/**
 * Host Info
 * **/
var host = 'api.haru.io';
var appId = 'appid';
var restId = 'restid';
//var host = 'localhost';

/**
 * Device Data
 * **/
var deviceToken = uuid();
var deviceType = 'android';
var pushType = 'mqtt';
var channels = ['a', 'b'];

/**
 * User Data
 * **/
var username = uid(5);
var password = 'test';
var email = uid(5)+'@gmail.com';

async.series([
    function CreateInstallation(callback) {
        /**
         *  Create New Installation
         * **/
        var installation_body = { deviceToken: deviceToken,deviceType: deviceType, pushType: pushType, channels: channels};
        var installation_options = {
            url: 'http://'+host+'/1/installations',
            method: 'POST',
            headers: {
                'Application-Id': appId,
                'Rest-API-Id': restId,
                'Content-Type': 'application/json'
            },
            json: installation_body
        };

        request(installation_options, function(error ,res, body) {
            callback(error, body);
        });
    },
    function Signup(callback) {
        /**
         * Create New User
         * **/

        var signup_body = { username: username, password: password, email: email, deviceToken: deviceToken};
        var signup_options = {
            url: 'http://'+host+'/1/users',
            method: 'POST',
            headers: {
                'Application-Id': appId,
                'Rest-API-Id': restId,
                'Content-Type': 'application/json'
            },
            json: signup_body
        };

        request(signup_options, function(error ,res, body) {
            callback(error, body);
        });
    }
], function done(error, results) {
    /**
     * Wait Notification
     * **/

    client.subscribe(deviceToken);
    console.log('[%s] wait notification', deviceToken);

    client.on('message', function(topic, message) {
        console.log('get message : ',message);

        var json = JSON.parse(message);
        console.log(json.alert);
    });
});





