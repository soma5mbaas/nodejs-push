var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var cors = require('cors');

var index = require('./routes/index');
var push = require('./routes/push');

var store = require('haru-nodejs-store');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cors());

store.connect(require('./config').store);

// app.use(token.checkToken());
app.use('/', index);

// version 1.0
app.use('/push', push);


module.exports = app;
