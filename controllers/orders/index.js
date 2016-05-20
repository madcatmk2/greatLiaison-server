'use strict';

var _ = require('underscore');
var paypal = require('paypal-rest-sdk');
var Order = require('../../models/orderModel');
var Product = require('../../models/productModel');

module.exports = function(app) {
  /**
   * @api {get} /orders Get all orders
   * @apiGroup orders
   *
   * @apiDescription This route should be accessed by the CMS only. It returns
   * all the orders placed.
   *
   * @apiSuccess {Object} orders List of orders.
   */
  app.get('/', function(req, res) {
    Order.find(function(err, orders) {
      if (err) {
        console.log('GET /orders error: ' + err);
        return res.status(500).send('Error: ' + err.message);
      }

      res.json({
        success: true,
        orders: arrayToObject(orders, '_id')
      });
    });
  });

  /**
   * @api {get} /orders/:orderId Get an order
   * @apiGroup orders
   *
   * @apiDescription This route should be accessed by the CMS only. It returns
   * a specific order.
   *
   * @apiSuccess {Object} order The order.
   */
  app.get('/:orderId', function(req, res) {
    Order.findOne(
      { '_id': req.params.orderId },
      function(err, order) {
        if (err) {
          console.log('GET /orders/:orderId error: ' + err);
          return res.status(500).send('Error: ' + err.message);
        }

        if (order) {
          res.json({
            success: true,
            order: order
          });
        } else {
          res.status(404).send('Order not found');
        }
    });
  });

  /**
   * @api {post} /orders Add an order
   * @apiGroup orders
   *
   * @apiParam {String} firstName Customer's first name.
   * @apiParam {String} lastName Customer's last name.
   * @apiParam {String} phone Customer's phone number.
   * @apiParam {String} email Customer's email address.
   * @apiParam {String} address1 Customer's shipping address (line 1).
   * @apiParam {String} address2 Customer's shipping address (line 2).
   * @apiParam {String} city Customer's shipping address city.
   * @apiParam {Number} subTotal Customer's cart subtotal.
   * @apiParam {String} paymentMethod Customer's payment method.
   * @apiParam {String} referrer Person who referred the customer.
   *
   * @apiDescription Creates a new order, with customer and shipping
   * information. Invoked once the customer submits the order (but before
   * Paypal payment is processed). The cart doesn't need to be passed to the
   * server because it's stored as a session variable.
   *
   * @apiSuccess {Object} order Returns the completed order.
   */
  app.post('/', function(req, res) {
    var order = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
      email: req.body.email,
      address1: req.body.address1,
      address2: req.body.address2,
      city: req.body.city,
      subTotal: req.body.subTotal,
      paymentMethod: req.body.paymentMethod,
      referrer: req.body.referrer
    };

    // Input checking
    var missingKeys = [];
    _.each(order, function(value, key) {
      if (key !== 'referrer' && !value) {
        missingKeys.push(key);
      }
    });

    if (missingKeys.length > 0) {
      return res.status(400).send('Params missing: ' + missingKeys);
    }

    // Iterate through the shopping cart, then double check the subtotal
    if (!req.session.cart || Object.keys(req.session.cart).length === 0) {
      return res.status(403).send('The shopping cart is empty.');
    }

    var cart = req.session.cart;
    var cartProductIds = _.keys(cart);

    Product
      .where('_id').in(cartProductIds)
      .select('_id name sku fullPrice')
      .exec(function(err, products) {
        if (err) {
          console.log('POST /orders error: ' + err);
          return res.status(500).send('Error: ' + err.message);
        }

        if (products && products.length === cartProductIds.length) {
          // Save to the session for use later
          req.session.cartProducts = arrayToObject(products, '_id');

          var subTotal = _.reduce(products, function(memo, product) {
            return memo + (product.fullPrice * cart[product._id].quantity);
          }, 0);

          if (subTotal !== order.subTotal) {
            return res.status(403).send('The subtotal sent from the client ' +
              ' does not match the cart subtotal.');
          }

          // Proceed with the payment flow, now that everything is validated
          req.session.order = order;
          if (order.paymentMethod === 'cash') {
            insertOrder(req, res);
          } else if (order.paymentMethod === 'paypal') {
            // create the paypal payment
          }

        } else {
          console.log('Error placing order: Some of the items in the cart ' +
            'do not exist.');
          return res.status(403).send('Some of the items in the cart do ' +
            'not exist.');
        }
    });
  });

  /**
   * @api {put} /orders/:orderId Update an order
   * @apiGroup orders
   *
   * @apiDescription This route should be accessed by the CMS only. It updates
   * only a subset of fields for the order.
   *
   * @apiSuccess {Object} order The updated order.
   */
  app.put('/:orderId', function(req, res) {
    res.status(404).send('To-do');
  });

  /**
   * @api {delete} /orders/:orderId Delete an order
   * @apiGroup orders
   *
   * @apiDescription This route should be accessed by the CMS only. It deletes
   * a specific order.
   *
   * @apiSuccess {Object} orders The updated list of orders
   */
  app.delete('/:orderId', function(req, res) {
    /*
     * Need to be careful about this. How to process a refund? How to trigger
     * email cancellation? Etc...
     */

    res.status(404).send('To-do');
  });

  /**
   *
   */

  /*
   * Helper methods
   */
  var arrayToObject = function(array, idString) {
    return _.object(_.pluck(array, idString), array);
  };

  var generateOrderNumber = function(cb) {
    var orderNumber = parseInt(Math.random() * 100000000);
    Order.findOne(
      { 'orderNumber': orderNumber },
      function(err, order) {
        if (err) {
         res.status(500).send('Error generating order number');
        }

        if (!order) {
         cb(orderNumber);
        } else {
         generateOrderNumber(cb);
        }
      }
    );
  };

  /*
   * If the payment method is Paypal, this function is called only when the
   * backend receives the executed paypal transaction callback.
   */
  var insertOrder = function(req, res) {
    var saveOrder = function(orderNumber) {
      var savedOrder = req.session.order;
      var order = {
        orderNumber: orderNumber,
        status: 'active',
        shippingInfo: {
          firstName: savedOrder.firstName,
          lastName: savedOrder.lastName,
          phone: savedOrder.phone,
          email: savedOrder.email,
          address1: savedOrder.address1,
          address2: savedOrder.address2,
          city: savedOrder.city
        },
        totalAmount: savedOrder.subTotal,
        paymentMethod: savedOrder.paymentMethod
      };

      if (savedOrder.referrer) {
        order.referrer = savedOrder.referrer;
      }

      // Populate items
      var cartProducts = req.session.cartProducts;
      order.items = _.map(req.session.cart, function(item) {
        var product = cartProducts[item.productId];
        return {
          productId: product._id,
          productName: product.name,
          sku: product.sku,
          price: product.fullPrice,
          quantity: item.quantity
        };
      });

      // Populate paypal details, if available
      if (savedOrder.paypal) {
        order.paypal = savedOrder.paypal;
      }

      var newOrder = new Order(order);
      newOrder.save(function(err, savedOrder) {
        if(err) {
         console.log('Error creating order: ' + err);
         return res.status(500).send('Error: ' + err.message);
        }

        /*
         * TODO: Queue an email to sales@gll.com.hk, as well as transactional
         * email to the customer.
         */

        delete req.session.cart;
        delete req.session.cartProducts;
        delete req.session.order;

        res.json({
         success: true,
         order: savedOrder
        });
      });
    };

    generateOrderNumber(saveOrder);
  };
};
