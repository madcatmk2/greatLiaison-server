'use strict';

var _ = require('underscore');
var paypal = require('paypal-rest-sdk');
var Order = require('../../models/orderModel');
var paypalConfig = require('../../config/paypal');
var Product = require('../../models/productModel');

paypal.configure(paypalConfig);

module.exports = function(app) {

  /**
   * Private APIs: Paypal payment creation callback routes
   */
  app.get('/paymentsuccess', executePaypalPayment);
  app.get('/paymentcancel', function(req, res) {
    res.redirect(req.session.origin + '/checkout?cancelorder=true');
    deleteCheckoutState(req, 'cancel');
  });

  /**
   * @api {get} /orders Get all orders
   * @apiGroup orders
   *
   * @apiDescription This route should be accessed by the CMS only. It returns
   * all the orders placed.
   *
   * @apiSuccess {Object} orders List of orders.
   */
  app.get('/', function(req, res, next) {
    Order.find(function(err, orders) {
      if (err) {
        return next(err);
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
  app.get('/:orderId', function(req, res, next) {
    Order.findOne(
      { '_id': req.params.orderId },
      function(err, order) {
        if (err) {
          return next(err);
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
  app.post('/', function(req, res, next) {
    var order = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
      email: req.body.email,
      address1: req.body.address1,
      address2: req.body.address2,
      city: req.body.city,
      subTotal: parseInt(req.body.subTotal),
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
      return res.status(400).send({error: 'Params missing: ' + missingKeys});
    }

    // Iterate through the shopping cart, then double check the subtotal
    if (!req.session.cart || Object.keys(req.session.cart).length === 0) {
      return res.status(403).send({error: 'The shopping cart is empty.'});
    }

    var cart = req.session.cart;
    var cartProductIds = _.keys(cart);

    Product
      .where('_id').in(cartProductIds)
      .select('_id name sku fullPrice')
      .exec(function(err, products) {
        if (err) {
          return next(err);
        }

        if (products && products.length === cartProductIds.length) {
          var subTotal = _.reduce(products, function(memo, product) {
            return memo + (product.fullPrice * cart[product._id].quantity);
          }, 0);

          if (subTotal !== order.subTotal) {
            return res.status(403).send({
              error:'The subtotal sent from the client does not match.'
            });
          }

          // Save to the session for use later
          req.session.cartProducts = arrayToObject(products, '_id');
          req.session.order = order;

          // Proceed with the payment flow, now that everything is validated
          if (order.paymentMethod === 'cash') {
            insertOrder(req, res, next);
          } else if (order.paymentMethod === 'paypal') {
            createPaypalPayment(req, res, next);
          } else {
            return res.status(403).send({error: 'Invalid payment method.'});
          }

        } else {
          return res.status(403).send({
            error: 'Some items in the cart do not exist.'
          });
        }
    });
  });

  /**
   * @api {put} /orders/:orderId Update an order (TO-DO)
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
    Order.remove({_id: req.params.orderId }, function(err, response) {
      if(err) {
        return next(err);
      }

      // TODO: Send cancellation email

      // TODO: Process refund on Paypal

      res.json({
        success: true,
        results: response.result
      });
    });

    res.status(404).send('To-do');
  });

  /*
   * Helper methods
   */
  function arrayToObject(array, idString) {
    return _.object(_.pluck(array, idString), array);
  }

  function generateOrderNumber(cb) {
    var min = 10000000;
    var max = 100000000;
    var orderNumber = Math.floor(Math.random() * (max - min)) + min;

    Order.findOne(
      { 'orderNumber': orderNumber },
      function(err, order) {
        if (!order) {
         cb(orderNumber);
        } else {
         generateOrderNumber(cb);
        }
      }
    );
  }

  /*
   * If the payment method is Paypal, this function is called only when the
   * backend receives the executed paypal transaction callback.
   */
  function insertOrder(req, res, next) {
    var saveOrder = function(orderNumber) {
      var sessionOrder = req.session.order;
      var order = {
        orderNumber: orderNumber,
        status: 'active',
        shippingInfo: {
          firstName: sessionOrder.firstName,
          lastName: sessionOrder.lastName,
          phone: sessionOrder.phone,
          email: sessionOrder.email,
          address1: sessionOrder.address1,
          address2: sessionOrder.address2,
          city: sessionOrder.city
        },
        totalAmount: sessionOrder.subTotal,
        paymentMethod: sessionOrder.paymentMethod
      };

      if (sessionOrder.referrer) {
        order.referrer = sessionOrder.referrer;
      }

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

      if (sessionOrder.paypal) {
        order.paypal = sessionOrder.paypal;
      }

      var newOrder = new Order(order);
      newOrder.save(function(err, savedOrder) {
        if(err) {
          return next(err);
        }

        deleteCheckoutState(req, 'success');

        /*
         * TODO: Queue an email to sales@gll.com.hk, as well as transactional
         * email to the customer.
         */

        if (savedOrder.paymentMethod === 'paypal') {
          var origin = req.session.origin.slice();
          delete req.session.origin;

          res.redirect(origin +
            '/ordersuccess?orderNumber=' +
            savedOrder.orderNumber
          );
        } else {
          // cash payment, return the order
          res.json({
           success: true,
           orderNumber: savedOrder.orderNumber
          });
        }
      });
    };

    generateOrderNumber(saveOrder);
  }

  // Invokes the Paypal SDK to initiate a payment process.
  function createPaypalPayment(req, res, next) {
    var host = req.headers.host;
    var order = req.session.order;
    var paymentData = {
      intent: 'sale',
      payer: {
        payment_method: 'paypal'
      },
      redirect_urls: {
        return_url: 'http://' + host + '/api/orders/paymentsuccess',
        cancel_url: 'http://' + host + '/api/orders/paymentcancel'
      },
      transactions: [{
        amount: {
          currency: 'HKD',
          total: order.subTotal
        },
        description: 'G&L online store purchase.'
      }]
    };

    paypal.payment.create(paymentData, function (err, response) {
      if (err) {
        return next(err);
      }

      req.session.origin = req.headers.origin;
      req.session.order.paypal = {
        paymentId: response.id
      };

      var links = response.links;
      for (var i = 0; i < links.length; i++) {
        if (links[i].rel === 'approval_url') {
          res.json({
            success: true,
            redirectURL: links[i].href
          });
        }
      }
    });
  }

  // Invokes the Paypal SDK to execute an authorized payment.
  function executePaypalPayment(req, res, next) {
    var paymentId = req.session.order.paypal.paymentId;
    var payer = { payer_id : req.query.PayerID };

    paypal.payment.execute(paymentId, payer, {}, function (err, response) {
      if (err) {
        return next(err);
      }

      if (response) {
        var paypal = _.extend(req.session.order.paypal, {
          paymentDate: response.create_time,
          saleId: response.transactions[0].related_resources[0].sale.id,
          cartId: response.cart
        });

        var paypalPayer = response.payer.payer_info;
        paypal.payer = {
          id: paypalPayer.payer_id,
          firstName: paypalPayer.first_name,
          lastName: paypalPayer.last_name,
          email: paypalPayer.email,
          shippingAddress: {
            recipientName: paypalPayer.shipping_address.recipient_name,
            line1: paypalPayer.shipping_address.line1 || '',
            line2: paypalPayer.shipping_address.line2 || '',
            city: paypalPayer.shipping_address.city,
            state: paypalPayer.shipping_address.state,
            postalCode: paypalPayer.shipping_address.postal_code,
            countryCode: paypalPayer.shipping_address.country_code
          }
        };

        req.session.order.paypal = paypal;
        insertOrder(req, res, next);
      } else {
        res.status(500).send({error: 'Error processing Paypal payment.'});
      }
    });
  }

  function deleteCheckoutState(req, status) {
    delete req.session.cartProducts;
    delete req.session.order;

    if (status === 'success') {
      delete req.session.cart;
    }
  }

};
