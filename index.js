'use strict';

var express  = require('express');
var kraken   = require('kraken-js');
var db       = require('./lib/database');
var path     = require('path');

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
app.use('/apidoc', express.static(__dirname + '/apidoc'));
app.on('start', function () {
  console.log('Application ready to serve requests.');
  console.log('Environment: %s', app.kraken.get('env:env'));
});
