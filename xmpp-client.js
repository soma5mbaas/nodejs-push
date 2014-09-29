'use strict';

var xmpp = require('node-xmpp');
var argv = process.argv

/**

2 : jid
3 : password

**/

var client = new xmpp.Client( {
    jid: argv[2],
    password: argv[3],
    host: '::1',
    port: 5222
} );

client.on('online', function() {
    console.log('online');

    client.send( new xmpp.Element('presence', { }).c('show').t('chat').up().c('status').t('hellow world') );
});

client.on('stanza', function(stanza) {
    // if(stanza.is('message') && (stanza.attrs.type !== 'error')) {
    //     stanza.attrs.to = stanza.attrs.from;
    //     delete stanza.attrs.from;

    //     console.log('Sending Response' + stanza.root().toString());

    //     client.send(stanza);
    // }

    if( stanza.is('message') && stanza.attrs.type === 'chat' ) {
        console.log( stanza.attrs.from + ': '+ stanza.attrs.body);
    }
    
});

client.on('error', function() {
    console.log(error);
});

process.stdin.setEncoding('utf8');
process.stdin.resume();
process.stdin.on('data', function(data) {
    client.send( new xmpp.Message({ type: 'chat' }).c('body').t(data) );
});