'use strict';

var mongoose = require('mongoose');

var cartModelSchema = mongoose.Schema({
// var cartModel = function () {

  username      : String,
  cartItem      : {
    item_id     : String,
    name        : String,
    volume      : Number,
    prettyVolume: String,
    price       : Number,
    prettyPrice : String,
    qty         : Number
  }
});

/*   return mongoose.model('Cart', productSchema);

}; */

// module.exports = new cartModel();
module.exports = mongoose.model('carts', cartModelSchema);
