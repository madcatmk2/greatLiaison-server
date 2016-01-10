'use strict';

var mongoose = require('mongoose');

var cartModel = function () {

  // Define a super simple schema for our cart.
  var productSchema = mongoose.Schema({
    username: String,
    item_id: String,
    name: String,
    volume: Number,
    prettyVolume: String,
    price: Number,
    prettyPrice: String,
    qty: Number
  });

  return mongoose.model('Cart', productSchema);

};

module.exports = new cartModel();
