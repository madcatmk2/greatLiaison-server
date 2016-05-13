'use strict';

var _ = require('underscore');

module.exports = function(app) {
  /**
   * @api {get} /cart Returns the current shopping cart
   * @apiGroup cart
   *
   * @apiSuccess {Object} cart Shopping cart
   */
  app.get('/', function(req, res) {
    req.session.cart = req.session.cart || {};
    displayCart(req, res);
  });

  /**
   * @api {post} /cart Add item to cart
   * @apiGroup cart
   *
   * @apiParam {String} productId Product ID.
   * @apiParam {Number} quantity Product quantity.
   *
   * @apiSuccess {Object} cart Returns the updated shopping cart.
   */
  app.post('/', function(req, res) {
    var item = {
      productId: req.body.productId,
      quantity: req.body.quantity
    };

    // Input checking
    var missingKeys = [];
    _.each(item, function(value, key) {
      if (!value) {
        missingKeys.push(key);
      }
    });
    if (missingKeys.length > 0) {
      var errorText = 'Params missing: ' + missingKeys;
      console.log('POST /cart - ' + errorText);
      return res.status(400).send(errorText);
    }

    var cart = req.session.cart = req.session.cart || {};

    // Update item if it exists in cart
    if (cart[item.productId]) {
      cart[item.productId].quantity += item.quantity;
    } else {
      cart[item.productId] = item;
    }

    res.redirect('./cart');
  });

  /**
   * @api {put} /cart/:productId Updates an item in the cart
   * @apiGroup cart
   *
   * @apiParam {String} quantity Quantity to update to.
   *
   * @apiSuccess {Object} cart Updated shopping cart
   */
  app.put('/:productId', checkCartEmpty, function(req, res) {
    var item = req.session.cart[req.params.productId];
    var quantity = req.body.quantity;

    if (!item) {
      var errorText = 'Product not found.';
      console.log('PUT /cart/:productId - ' + errorText);
      return res.status(404).send(errorText);
    };

    if (!quantity) {
      var errorText = 'Missing quantity to update.';
      console.log('PUT /cart/:productId - ' + errorText);
      return res.status(400).send(errorText);
    }

    item.quantity = quantity;
    displayCart(req, res);
  });

  /**
   * @api {delete} /cart Clears the shopping cart
   * @apiGroup cart
   *
   * @apiSuccess {Object} cart Updated shopping cart
   */
  app.delete('/', function(req, res) {
    req.session.cart = {};
    displayCart(req, res);
  });

  /**
   * @api {delete} /cart/:productId Removes an item from the cart
   * @apiGroup cart
   *
   * @apiSuccess {Object} cart Updated shopping cart
   */
  app.delete('/:productId', checkCartEmpty, function(req, res) {
    var item = req.session.cart[req.params.productId];
    if (!item) {
      var errorText = 'Product not found.';
      console.log('DELETE /cart/:productId - ' + errorText);
      return res.status(404).send(errorText);
    };

    delete req.session.cart[req.params.productId];

    displayCart(req, res);
  });

  /*
   * Helper methods
   */
  var displayCart = function(req, res) {
    res.json({
      success: true,
      cart: req.session.cart
    });
  };

  /*
   * Other middleware
   */
  function checkCartEmpty(req, res, next) {
    if (!req.session.cart) {
      return res.status(400).send('Cart is empty');
    } else {
      next();
    }
  }
};
