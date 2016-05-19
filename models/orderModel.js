// 'use strict';

// var mongoose = require('mongoose');

// var orderModel = function() {
//   var orderSchema = mongoose.Schema({
//     orderNumber: Number,
//     date: { type: Date, default: Date.now },
//     status: String,
//     // items: [orderItemSchema],
//     shippingInfo: {
//       firstName: String,
//       lastName: String,
//       phoneNumber: String,
//       emailAddress: String,
//       address1: String,
//       address2: String
//     },
//     subTotal: Number,
//     referrer: String,
//     paypalTransactionId: String // Just guessing here
//   });

//   var orderItemSchema = mongoose.Schema({
//     productId: String,
//     productName: String,
//     sku: String,
//     price: Number,
//     quantity: Number
//   });

//   // Static and instance methods TBD

//   return mongoose.model('Order', orderSchema);
// };

// module.exports = new orderModel();
