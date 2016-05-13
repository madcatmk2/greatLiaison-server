'use strict';

var mongoose = require('mongoose');
mongoose.set('debug', true);

// var orderItemModelSchema = mongoose.Schema({
//   item_id     : String,
//   name        : String,
//   volume      : Number,
//   prettyVolume: String,
//   price       : Number,
//   prettyPrice : String,
//   qty         : Number
// });

var orderHistoryUserModelSchema = mongoose.Schema({
  // username      : String,
  // orderItems    : [orderItemModelSchema],
  // orderStatus	: String,
  // orderTotal	: Number,
  // orderDate		: Date
  orderCartId : String,
  orderStatus : String,
  orderTotal  : Number,
  orderNumber : String,
  orderDate   : Date
});

var orderModelSchema = mongoose.Schema({
	username	: String,
	orderHistory: [orderHistoryUserModelSchema]
});

// module.exports = mongoose.model('orderItems', orderItemModelSchema);
module.exports = mongoose.model('userOrderHistories', orderHistoryUserModelSchema);
module.exports = mongoose.model('userOrders', orderModelSchema);
/* var orderItem = mongoose.model('orderItems', orderItemModelSchema);
var userCart = mongoose.model('userCarts', orderHistoryModelSchema);*/
