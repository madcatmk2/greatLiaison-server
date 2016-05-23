'use strict';

var IndexModel = require('../models/index');

module.exports = function (router) {
  var model = new IndexModel();

  router.get('/', function (req, res) {
    res.json('You\'ve reached the Great Liaison Online Shopping Store API!');
  });

  router.post('/', function (req, res) {
    res.json('You\'ve reached the Great Liaison Online Shopping Store API!');
  });
};
