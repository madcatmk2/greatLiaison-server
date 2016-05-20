'use strict';

var mongoose = require('mongoose');

var orderModel = function() {

  var orderItemSchema = mongoose.Schema({
    productId: String,
    productName: String,
    sku: String,
    price: Number,
    quantity: Number
  });

  var shippingInfoSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    phone: String,
    email: String,
    address1: String,
    address2: String,
    city: String
  });

  var paypalSchema = mongoose.Schema({
    transactionId: String,
    payer: {
      id: String,
      firstName: String,
      lastName: String,
      email: String,
      shippingAddress: {
        recipientName: String,
        line1: String,
        line2: String,
        city: String,
        state: String,
        postalCode: String,
        countryCode: String
      }
    }
  });

  var orderSchema = mongoose.Schema({
    orderNumber: Number,
    date: { type: Date, default: Date.now },
    status: String,
    items: [orderItemSchema],
    shippingInfo: shippingInfoSchema,
    totalAmount: Number,
    referrer: String,
    method: String,
    paypal: paypalSchema
  });

  // Static and instance methods TBD

  return mongoose.model('Order', orderSchema);
};

module.exports = new orderModel();
