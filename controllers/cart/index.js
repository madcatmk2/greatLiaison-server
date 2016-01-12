'use strict';

var paypal = require('paypal-rest-sdk');
var paypalConfig = require('../../config/paypal');

var auth = require('../auth/index');

var productModel = require('../../models/productModel');
var cartModel = require('../../models/cartModel');

// For testing Paypal SDK

var create_payment_json = {
  "intent": "sale",
  "payer": {
    "payment_method": "paypal"
  },
  "redirect_urls": {
    "return_url": "http://google.com",
    "cancel_url": "http://yahoo.com"
  },
  "transactions": [{
    "item_list": {
      "items": [{
        "name": "Cream",
        "sku": "CREAMSKU001",
        "price": "40.00",
        "currency": "HKD",
        "quantity": 1
      }]
    },
    "amount": {
      "currency": "HKD",
      "total": "40.00"
    },
    "description": "This is the payment description."
  }]
};

/*
 *  Commented by Hason Ng on 20160112:
 *  We are not storing any CC information so this is an irrelevant method of payment
 */
/* var savedCard = {
  "type": "visa",
  "number": "4417119669820331",
  "expire_month": "11",
  "expire_year": "2019",
  "cvv2": "123",
  "first_name": "Joe",
  "last_name": "Shopper"
}; */

module.exports = function (router) {
  require('../auth/passport')(router);

  paypal.configure(paypalConfig);

  router.post('/payByPaypal', function (req, res) {
    checkoutByPaypal(req, res);
  });

  /*
 *  Commented by Hason Ng on 20160112:
 *  We are not storing any CC information so this is an irrelevant method of payment
 */
/*   router.post('/payByCreditCard', function (req, res) {
    checkoutByCreditCard(req, res);
  }); */

  /**
    * Returns the current shopping cart
    */
  router.get('/', isLoggedIn, loadCartFromDB, function (req, res) {

    // Retrieve the shopping cart from memory
    var cart = req.session.cart,
        displayCart = {items: [], total: 0},
        total = 0;

    console.log('session cart: ' + cart);

    if (!cart) {
      console.log('Session cart not found, searching DB');
//       console.log('username: ' + req.user.local.email);

      // Try to retrieve cart from database from previous session
      cartModel.find({ 'username': req.user.local.email }, '-_id -username -__v', function (err, retrievedCart) {

        var displayCart = {items: [], total: 0},
            total = 0;

        if (err) {
          console.log(err);
        }

        if (!retrievedCart) {
          res.json({ message: 'Your cart is empty! (1)' });
          return;
        }

        var newCart = {};

        // Query each item data and add to cart
        for (var i = 0; i < retrievedCart.length; i++) {
          var model =
              {
                name: retrievedCart[i].name,
                volume: retrievedCart[i].volume,
                prettyVolume: retrievedCart[i].prettyVolume,
                price: retrievedCart[i].price,
                prettyPrice: retrievedCart[i].prettyPrice,
                qty: retrievedCart[i].qty
              };

          displayCart.items.push(model);
          total += (retrievedCart[i].qty * retrievedCart[i].price);

          newCart[retrievedCart[i].item_id] = model;
        }

        if (total == 0) {
          res.json({ message: 'Your cart is empty! (2a)' });
          return;
        }

        req.session.total = displayCart.total = total.toFixed(2);
        req.session.cart = newCart;

        res.json({ message: displayCart });
        return;
      });
    } else {
      console.log('Session cart found');

      // Display products in session's cart
      for (var item in cart) {
        if (cart[item] != null)
        {
          displayCart.items.push(cart[item]);
          total += (cart[item].qty * cart[item].price);
        }
      }

      if (total == 0)
      {
        res.json({ message: 'Your cart is empty! (2b)' });
        return;
      }

      req.session.total = displayCart.total = total.toFixed(2);

//       res.json({ message: JSON.stringify(displayCart, null, 1) });
      res.json({ message: displayCart });
    }
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
      } else if (id == null || prod == null) {
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

//       var newCart = new cartModel({ username: req.user.local.email, items: cart });

      var query = {
        username: req.user.local.email,
        item_id: id
      };
      var update = {
        username: req.user.local.email,
        name: prod.name,
        volume: prod.volume,
        prettyVolume: prod.prettyVolume(),
        price: prod.price,
        prettyPrice: prod.prettyPrice(),
        qty: cart[id].qty
      };
      var options = { upsert: true };

      cartModel.findOneAndUpdate(query, update, options, function(err, updateCart) {
        if(err) {
          console.log('Update cart error', err);
        }

        console.log(updateCart);
      });

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

function loadCartFromDB(req, res, next) {

  // Try to retrieve cart from database from previous session
  cartModel.find({ 'username': req.user.local.email }, '-_id -username -__v', function (err, retrievedCart) {

    var displayCart = {items: [], total: 0},
        total = 0;

    if (err) {
      console.log(err);
    }

    if (!retrievedCart) {
      console.log('No cart found in passport.js');
      return;
    }

    console.log('retrievedCart: ' + retrievedCart);

    var newCart = {};

    // Query each item data and add to cart
    for (var i = 0; i < retrievedCart.length; i++) {
      var model =
          {
            name: retrievedCart[i].name,
            volume: retrievedCart[i].volume,
            prettyVolume: retrievedCart[i].prettyVolume,
            price: retrievedCart[i].price,
            prettyPrice: retrievedCart[i].prettyPrice,
            qty: retrievedCart[i].qty
          };

      displayCart.items.push(model);
      total += (retrievedCart[i].qty * retrievedCart[i].price);

      newCart[retrievedCart[i].item_id] = model;

      console.log('model: ' + JSON.stringify(model, null, 1));
    }

    if (total == 0) {
      console.log('No cart info in passport.js');
      return;
    }

    req.session.total = displayCart.total = total.toFixed(2);

    console.log(newCart);

//     return newCart;
    req.session.cart = newCart;

    return next();

//     return;
  });
}

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
  //   isLoggedIn : function(req, res, next) {

  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
  {
    return next();
  }

  // if they aren't redirect them to the home page
  res.redirect('../auth/unauth');
}

function checkoutByPaypal(req, res) {
  paypal.payment.create(create_payment_json, function (err, payment) {
    if (err) {
      console.log(err);
      res.json({ message: err });
    } else {
      console.log("Create Payment Response");
      console.log(JSON.stringify(payment));
      res.json({ message: payment });
    }
  });
}

/*
 *  Commented by Hason Ng on 20160112:
 *  We are not storing any CC information so this is an irrelevant method of payment
 */
/* function checkoutByCreditCard(req, res) {
  paypal.creditCard.create(savedCard, function (err, credit_card) {
    if (err) {
      console.log(err);
      res.json({ message: err });
    } else {
      console.log("Save Credit Card Response");
      console.log(JSON.stringify(credit_card));
      res.json({ message: credit_card });
    }
  });
} */
