'use strict';

var mongoose = require('mongoose');

var productModel = function () {
  var productSchema = mongoose.Schema({
    sku: String,
    name: String,
    englishName: String,
    categoryName: String,
    categoryId: String,
    description: String,
    instructions: String,
    size: String,
    origin: String,
    fullPrice: String,
    salePrice: String,
    priceCurrency: String
  });

  productSchema.methods.prettyPrint = function() {
    return this.sku + ': ' + this.name + ': ' + this.categoryName;
  };

  return mongoose.model('Product', productSchema);
};

module.exports = new productModel();
