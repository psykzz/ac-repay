'use strict';
var config = require('../config')
var mongoose = require('mongoose');

// Mongoose plugins
var findOrCreate = require('mongoose-findorcreate')

mongoose.connect(`mongodb://${config.db.url}/${config.db.schema_version}_ac-repay_${process.env.NODE_ENV}`);

var Schema = mongoose.Schema;

var ReimbursementSchema = new Schema({
  eventId: {type: String, required: true},
  state: {type: String, enum: ['unclaimed', 'claimed', 'declined', 'approved', 'paid'], required: true, default: 'unclaimed'},
  claimedBy: {type: String},
  claimedAt: {type: String},
  declinedBy: {type: String},
  declinedAt: {type: String},
  declinedReason: {type: String},
  approvedBy: {type: String},
  approvedAt: {type: String},
  paidBy: {type: String},
  paidAt: {type: String},
  paidAmount: {type: String},
}, {
  timestamps: true
});
ReimbursementSchema.plugin(findOrCreate, {upsert: true});


var UserSchema = new Schema({
  discordId: {type: String, required: true},
  username: {type: String, required: true},
  accessToken: {type: String, required: true},
  refreshToken: {type: String, required: true},
  isStaff: {type: Boolean, default: false},
  isAdmin: {type: Boolean, default: false},
}, {
  timestamps: true
});
UserSchema.plugin(findOrCreate, {upsert: true});

module.exports.Reimbursement = mongoose.model('Reimbursement', ReimbursementSchema);
module.exports.User = mongoose.model('User', UserSchema);
