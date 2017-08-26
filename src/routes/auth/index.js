'use strict';
var debug = require('debug')('ac-repay:router:auth');
var express = require('express')
var router = express.Router()

var config = require('../../config')

var passport = require('passport');
var DiscordStrategy = require('passport-discord').Strategy;

var Models = require('../../models')

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(new DiscordStrategy({
    clientID: config.auth.clientId,
    clientSecret: config.auth.clientSecret,
    callbackURL: config.auth.callback,
    scope: ['identify']
  },
  function(accessToken, refreshToken, profile, cb) {
    debug(accessToken, refreshToken, profile)

    var isAdmin = (profile.id === '113752662788276232')

    var newProfile = {
      discordId: profile.id,
      username: `${profile.username}#${profile.discriminator}`,
      accessToken: accessToken,
      refreshToken: refreshToken,
    }

    Models.User.findOrCreate({discordId: profile.id}, newProfile, (err, res) => {
      res.isAdmin = res.isAdmin || isAdmin;
      res.isStaff = res.isStaff || isAdmin;
      res.save((err) => {
        debug(res)
        cb(err, res)
      })
    })
  }
));

router.get('/', passport.authenticate('discord'));
router.get('/callback', passport.authenticate('discord', {
  failureRedirect: '/'
}), (req, res) => {
  res.redirect('/auth/profile') // Successful auth
});



// Debug not for production
router.get('/debug/drop', (req, res) => {
  Models.User.remove({}, (err) => {
    debug("Dropping users table", err)
    res.redirect('/auth') // Successful auth
  })
})

module.exports.Router = router
module.exports.passport = passport
