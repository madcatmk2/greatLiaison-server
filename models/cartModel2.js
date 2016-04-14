'use strict';

var mongoose = require('mongoose');
mongoose.set('debug', true);
// var Array = mongoose.Types.Array;

var cartItemModelSchema = mongoose.Schema({
  item_id     : String,
  name        : String,
  volume      : Number,
  prettyVolume: String,
  price       : Number,
  prettyPrice : String,
  qty         : Number
});

var cartModelSchema = mongoose.Schema({
// var cartModel = function () {

  username      : String,
  cartStatus	: String,
  cartItems     : [cartItemModelSchema]
});

/*   return mongoose.model('Cart', productSchema);

}; */

// module.exports = new cartModel();
var cartItem = module.exports = mongoose.model('cartItems', cartItemModelSchema);
var userCart = module.exports = mongoose.model('userCarts', cartModelSchema);
/* var cartItem = mongoose.model('cartItems', cartItemModelSchema);
var userCart = mongoose.model('userCarts', cartModelSchema);*/
