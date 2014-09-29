var express = require('express');
var router = express.Router();
var push = require('../controllers/push');

/* GET home page. */
router.post('/', push.push);

module.exports = router;