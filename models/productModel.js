'use strict';

var mongoose = require('mongoose');

var productModel = function () {
  var productSchema = mongoose.Schema({
    sku: String,
    name: String,
    englishName: String,
    category: String,
    description: String,
    instructions: String,
    size: String,
    origin: String,
    fullPrice: String,
    salePrice: String,
    priceCurrency: String
  });

  return mongoose.model('Product', productSchema);
};

module.exports = new productModel();
