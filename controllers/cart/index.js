'use strict';

var productModel = require('../../models/productModel');

module.exports = function (router) {

  /**
    * Returns the current shopping cart
    */
  router.get('/', function (req, res) {

    //Retrieve the shopping cart from memory
    var cart = req.session.cart,
        displayCart = {items: [], total: 0},
        total = 0;

    if (!cart) {
      res.json({ message: 'Your cart is empty! (1)' });
      return;
    }

    //Ready the products for display
    for (var item in cart) {
      if (cart[item] != null)
      {
        displayCart.items.push(cart[item]);
        total += (cart[item].qty * cart[item].price);
      }
    }

    if (total == 0)
    {
      res.json({ message: 'Your cart is empty! (2)' });
      return;
    }
    req.session.total = displayCart.total = total.toFixed(2);

    res.json({ message: displayCart });
  });

  /**
    * Adds an item to the shopping cart
    */
  router.post('/', function (req, res) {
    //Load (or initialize) the cart
    req.session.cart = req.session.cart || {};
    var cart = req.session.cart;

    //Read the incoming product data
    var id = req.param('item_id');

    //Locate the product to be added
    productModel.findById(id, function (err, prod) {
      if (err) {
        console.log('Error adding product to cart: ', err);
        res.json({ message: 'Error adding product to cart: ' + err });
        return;
      } else if (id == null) {
        res.json({ message: 'Product not found' });
        return;
      }

      //Add or increase the product quantity in the shopping cart.
      if (cart[id]) {
        cart[id].qty++;
      }
      else {
        cart[id] = {
          name: prod.name,
          volume: prod.volume,
          prettyVolume: prod.prettyVolume(),
          price: prod.price,
          prettyPrice: prod.prettyPrice(),
          qty: 1
        };
      }

      res.json({ message: 'Item added' });

    });
  });

  /**
    * Deletes an item from the shopping cart
    */
  router.delete('/', function (req, res) {
    //Load (or initialize) the cart
    req.session.cart = req.session.cart || {};
    var cart = req.session.cart;

    //Read the incoming product data
    var id = req.param('item_id');

    //Remove or decrease the product quantity in the shopping cart.
    if (cart[id]) {
      cart[id].qty--;
      if (cart[id].qty <= 0) {
        cart[id] = null;
      }

      res.json({ message: 'Item removed from cart' });
    } else {
      res.json({ message: 'Item does not exist in cart' });
    }
  });
};
