'use strict';
// var debug = require('debug')('ac-repay:router:api');
var express = require('express')
var router = express.Router()

router.use('/admin', require('./admin'))
router.use('/', require('./thing'))

module.exports = router
