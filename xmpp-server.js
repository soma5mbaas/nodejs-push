'use strict';

var xmpp = require('node-xmpp')

/* This is a very basic C2S server example. One of the key design decisions
* of node-xmpp is to keep it very lightweight
* If you need a full blown server check out https://github.com/superfeedr/xmpp-server
*/

// Sets up the server.
var c2s = new xmpp.C2SServer({
    port: 5222,
    domain: 'localhost'
    //     key : "key.pem content",
    //     cert : "cert.pem content",
    // // or
    // tls: {
    //     keyPath: './examples/localhost-key.pem',
    //     certPath: './examples/localhost-cert.pem'
    // }

})

// On Connect event. When a client connects.
c2s.on('connect', function(client) {
    console.log('connect');
    // That's the way you add mods to a given server.

    // Allows the developer to register the jid against anything they want
    c2s.on('register', function(opts, cb) {
        console.log('REGISTER')
        cb(true)
    })

    // Allows the developer to authenticate users against anything they want.
    client.on('authenticate', function(opts, cb) {
        console.log('AUTH : ' + opts.jid + ' -> ' +opts.password)
        cb(null, opts) // cb(false)
    })

    client.on('online', function() {
        console.log('ONLINE')
        client.send( new xmpp.Message({ type: 'chat' }).c('body').t('Hello there, little client.'))
    })

    // Stanza handling
    client.on('stanza', function(stanza) {
          if (stanza.is('message') && (stanza.attrs.type === 'chat')) {
            stanza.attrs.to = stanza.attrs.from

            // and send back
            console.log('Sending response: ' + stanza.root().toString())
            client.send(stanza)
        }
    })

    // On Disconnect event. When a client disconnects
    client.on('disconnect', function() {
        console.log('DISCONNECT')
    })

})
