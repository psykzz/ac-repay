'use strict';
var debug = require('debug')('ac-repay:router:index');
var path = require('path')
var express = require('express')
var session = require('express-session')
var app = express();
var config = require('./config')

// var cors = require('cors')
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
  if(req.method == 'OPTIONS') {
    res.send(200);
  }
  else {
    next();
  }
});
app.use(session({
  secret: 'keyboard cat',
}))

var authRouter = require('./routes/auth').Router
var passport = require('./routes/auth').passport

app.use(passport.initialize());
app.use(passport.session());

var authRequired = (req, res, next) => {
  if(!req.user) {
    return res.redirect('/auth')
  }
  next()
}

// Routes
app.get('/api/profile', (req, res) => {
  res.json((req.user) ? req.user : {status: 'error', message: 'not logged in'})
})

app.use('/auth', authRouter)
app.use('/api', authRequired, require('./routes/api'))



app.use('/', express.static(path.join(__dirname, 'public')))

// app.get('/', (req, res) => {
//   res.json({status: 'ok'})
// })

app.listen(config.port, () => {
  debug(`listening on port ${config.port}`)
});
