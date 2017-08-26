'use strict';
var debug = require('debug')('ac-repay:router:api:admin');
var express = require('express')
var router = express.Router()

var Models = require('../../models')

var async = require('async')
var AlbionAPI = require('albion-api');

router.use((req, res, next) => {
  if(req.user && (req.user.isStaff || req.user.isAdmin)) {
    return next()
  }
  return res.status(401).end()
})


router.get('/status', (req, res) => {
  // TODO: Order by last updated
  Models.Reimbursement.find({}, (err, results) => {
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


router.get('/:eventId/approve', (req, res) => {
  // Set the event to claimed.
  // Will first check KB if event exists,
  // Will then find/create the event and set the status to claimed if unclaimed.
  var eventId = req.params.eventId

  async.waterfall([
    (cb) => AlbionAPI.getEventDetails(eventId, cb),
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
      result.state = 'approved'
      result.approvedAt = (new Date()).toISOString()
      result.approvedBy = req.user.username
      result.save(cb)
    }
  ], (err, results) => {
    if(err) {
      return res.status(500).json(err)
    }
    res.json(results)
  })
})


router.get('/:eventId/decline', (req, res) => {
  // Set the event to claimed.
  // Will first check KB if event exists,
  // Will then find/create the event and set the status to claimed if unclaimed.
  var eventId = req.params.eventId

  async.waterfall([
    (cb) => AlbionAPI.getEventDetails(eventId, cb),
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
      result.state = 'declined'
      result.declinedAt = (new Date()).toISOString()
      result.declinedBy = req.user.username
      result.declinedReason = "No reason provided"
      result.save(cb)
    }
  ], (err, results) => {
    if(err) {
      return res.status(500).json(err)
    }
    res.json(results)
  })
})


router.get('/:eventId/paid', (req, res) => {
  // Set the event to claimed.
  // Will first check KB if event exists,
  // Will then find/create the event and set the status to claimed if unclaimed.
  var eventId = req.params.eventId

  async.waterfall([
    (cb) => AlbionAPI.getEventDetails(eventId, cb),
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
      if(result.state !== 'approved') {
        return cb({status: 'error', message: 'event needs to be approved'})
      }
      cb(null, result)
    },
    (result, cb) => {
      result.state = 'paid'
      result.paidAt = (new Date()).toISOString()
      result.paidBy = req.user.username
      result.paidAmount = "0"
      result.save(cb)
    }
  ], (err, results) => {
    if(err) {
      return res.status(500).json(err)
    }
    res.json(results)
  })
})


router.delete('/:eventId', (req, res) => {
  var eventId = req.params.eventId
  Models.Reimbursement.findOne({eventId: eventId}, (err, result) => {
    if(err || !result) {
      return res.status(404).json({status: 'error', message: 'not found'})
    }

    result.remove((err) => {
      if(err) {
        return res.status(500).json({status: 'error', message: 'Unable to remove'})
      }
      res.json({status: 'ok', message: 'event deleted'})
    })
  })
})


module.exports = router
