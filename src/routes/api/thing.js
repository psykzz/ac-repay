'use strict';
var debug = require('debug')('ac-repay:router:api:admin');
var express = require('express')
var router = express.Router()

var Models = require('../../models')

var async = require('async')
var AlbionAPI = require('albion-api');

router.get('/status', (req, res) => {
  // TODO: Order by last updated
  Models.Reimbursement.find({claimedBy: req.user.username}, (err, results) => {
    if(err || !results) {
      debug("Error getting events", err, results)
      return res.status(404).json({
        status: 'error',
        message: 'not found'
      });
    }

    return res.json(results)
  })
})


router.get('/:eventId/status', (req, res) => {
  var eventId = req.params.eventId
  Models.Reimbursement.findOne({eventId: eventId}, (err, result) => {
    if(err || !result) {
      debug("Error getting event", err, result)
      return res.status(404).json({
        status: 'error',
        message: 'not found'
      });
    }

    return res.json(result)
  })
})


router.get('/:eventId/claim', (req, res) => {
  // Set the event to claimed.
  // Will first check KB if event exists,
  // Will then find/create the event and set the status to claimed if unclaimed.
  var eventId = req.params.eventId

  async.waterfall([
    (cb) => {
      AlbionAPI.getEventDetails(eventId, (err, results) => {
        cb(err, results)
      })
    },
    (eventDetails, cb) => {
      if(!eventDetails) {
        return cb({status: 'error', message: 'event not found on the killboard'})
      }
      cb()
    },
    (cb) => {
      Models.Reimbursement.findOrCreate({eventId: eventId}, {eventId: eventId}, (err, result) => {
        cb(err, result)
      })
    },
    (result, cb) => {
      if(result.state === 'paid') {
        return cb({status: 'error', message: 'event already paid'})
      }
      cb(null, result)
    },
    (result, cb) => {
      if(result.state !== 'unclaimed') {
        return cb({status: 'error', message: 'event already claimed'})
      }
      cb(null, result)
    },
    (result, cb) => {
      result.state = 'claimed'
      result.claimedAt = (new Date()).toISOString()
      result.claimedBy = req.user.username
      result.save(cb)
    }
  ], (err, results) => {
    if(err) {
      return res.status(500).json(err)
    }
    res.json(results)
  })
})

module.exports = router
