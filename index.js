'use strict';

var express  = require('express');
var kraken   = require('kraken-js');
var db       = require('./lib/database');

//var passport = require('passport');
//var flash    = require('connect-flash');

var options, app;

/*
 * Create and configure application. Also exports application instance for use by tests.
 * See https://github.com/krakenjs/kraken-js#options for additional configuration options.
 */
options = {
  onconfig: function (config, next) {
    db.config(config.get('databaseConfig'));

    next(null, config);
  }
};

app = module.exports = express();

app.use('/api', kraken(options));

//app.use(passport.initialize());
//app.use(passport.session()); // persistent login sessions
// app.use(flash()); // use connect-flash for flash messages stored in session

app.use(function(req, res, next) {
    // Set permissive CORS header - this allows this server to be used only as
    // an API server
    res.setHeader('Access-Control-Allow-Origin', '*');

    next();
});

app.on('start', function () {
    console.log('Application ready to serve requests.');
    console.log('Environment: %s', app.kraken.get('env:env'));
});

// route middleware to only allow connections from certain IP's
function isIPAllowed(ip) {

  // if IP is allowed, continue
  if (ip == '127.0.0.1' || ip == 'localhost') {
    return true;
  }

  // otherwise reject
  return false;
}
