/**
 * Created by syntaxfish on 14. 11. 6..
 */
var amqp = require('amqplib/callback_api');
var queue = require('./config').mqueue.push;
var config = require('./config');
var store = require('haru-nodejs-store');

var push = require('./handlers/push');

var _ = require('underscore');


store.connect(config.store);

function bail(err, conn) {
    console.error(err);
    if (conn) conn.close(function() { process.exit(1); });
}

function on_connect(err, conn) {
    if (err !== null) return bail(err);
    process.once('SIGINT', function() { conn.close(); });

    var q = 'push';

    conn.createChannel(function(err, ch) {
        if (err !== null) return bail(err, conn);
        ch.assertQueue(q, {durable: true}, function(err, _ok) {
            ch.consume(q, doWork, {noAck: false});
            console.log(" [*] Waiting for messages. To exit press CTRL+C");
        });

        function doWork(msg) {
            var body = JSON.parse(msg.content);
            body.options.page = body.page;

            console.log(" [%s] Received %s : %s",process.pid, body.applicationId, body.notification.message);
            push.pushNotification(body.options, body.notification, function(error, results) {
                ch.ack(msg);
            });
        }
    });
}

amqp.connect(queue.url, on_connect);