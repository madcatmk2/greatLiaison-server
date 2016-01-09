'use strict';

var mongoose = require('mongoose');

var productModel = function () {

  //Define a super simple schema for our products.
  var productSchema = mongoose.Schema({
    name: String,
    volume: Number,
    price: Number
  });

  //Verbose toString method
  productSchema.methods.whatAmI = function () {
    var greeting = this.name ?
        'Hello, I\'m a ' + this.name + ' with volume of ' + this.volume + 'mL. I\'m worth $' + this.price
    : 'I don\'t have a name :(';
    console.log(greeting);
  };

  //Format the volume of the product to show unit of measurement
  productSchema.methods.prettyVolume = function () {
    return this.volume + ' mL';
  };

  //Format the price of the product to show a dollar sign, and two decimal places
  productSchema.methods.prettyPrice = function () {
    return '$' + this.price.toFixed(2);
  };

  return mongoose.model('Product', productSchema);

};

module.exports = new productModel();
