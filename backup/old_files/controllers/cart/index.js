'use strict';

var paypal = require('paypal-rest-sdk');
var paypalConfig = require('../../config/paypal');

var auth = require('../auth/index');

var productModel = require('../../models/productModel');
var cartModel = require('../../models/cartModel');

var cartModel2 = require('../../models/cartModel2');
var userCarts = require('mongoose').model('userCarts');
var cartItems = require('mongoose').model('cartItems');

var orderModel = require('../../models/orderModel');
var userOrders = require('mongoose').model('userOrders');
var userOrderHistories = require('mongoose').model('userOrderHistories');
// var orderItems = require('mongoose').model('orderItems');

// For testing Paypal SDK

var create_payment_json = {
  "intent": "sale",
  "payer": {
    "payment_method": "paypal"
  },
  "redirect_urls": {
    "return_url": "127.0.0.1:8000/cart/paymentSuccess",
    "cancel_url": "127.0.0.1:8000/cart/"
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

  router.post('/paymentSuccess', isLoggedIn, loadCartFromDB, function (req, res) {

    var cart = req.session.cart,
        total = req.session.total,
        cart_id = req.session.cart_id;

    console.log(cart);

    var userOrderHistory = new userOrderHistories();
    userOrderHistory.orderCartId = cart_id;
    userOrderHistory.orderStatus = "Pending";
    userOrderHistory.orderTotal = total;
    userOrderHistory.orderNumber = "GLLORDER01"
    userOrderHistory.orderDate = Date.now();

    console.log('userOrderHistory: ' + userOrderHistory)

    var query = {
      'username': req.user.local.email,
    };
    var update = {
      '$push': {
        'orderHistory': userOrderHistory
      }
    };

    userOrders.update(query, update, function(err, updateUserOrder) {
      console.log('payment success: ' + updateUserOrder);
    
      res.json({ message: updateUserOrder });
    });

    // res.json({ message: 'lala' });
  });

  router.get('/getOutstandingOrders', isLoggedIn, function(req, res) {
    userOrders.find({ 'username': req.user.local.email }, function(err, retrievedOrders) {
      console.log('user pending orders: ' + retrievedOrders);

      var total = 0;

      if (err) {
        console.log(err);
      }

      var outstandingOrders = {};
      var outstandingOrdersUser = retrievedOrders[0];
      console.log('outstandingOrdersUser: ' + outstandingOrdersUser);

      res.json({ message: outstandingOrdersUser });

      // // Query each item data and add to cart
      // for (var i = 0; i < retrievedCartItems.length; i++) {
      //   /*var model =
      //       {
      //         name: retrievedCart[i].name,
      //         volume: retrievedCart[i].volume,
      //         prettyVolume: retrievedCart[i].prettyVolume,
      //         price: retrievedCart[i].price,
      //         prettyPrice: retrievedCart[i].prettyPrice,
      //         qty: retrievedCart[i].qty
      //       };*/

      //   // displayCart.items.push(cartItems[i]);
      //   total += (retrievedCartItems[i].qty * retrievedCartItems[i].price);

      //   newCart[retrievedCartItems[i].item_id] = retrievedCartItems[i];

      //   console.log('retrievedCartItems[' + i + ']: ' + JSON.stringify(retrievedCartItems[i], null, 1));
      // }

      // console.log('DB cart found');

      // console.log('newCart: ' + newCart);
      // // req.session.total = displayCart.total = total.toFixed(2);
      // req.session.total = total.toFixed(2);

      // req.session.cart_id = retrievedCart[0]._id;

      // req.session.cart = newCart;

      // return next();
    });
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
  // router.get('/', loadCartFromDB, function (req, res) {

  //   // Retrieve the shopping cart from memory
  //   var cart = req.session.cart,
  //       displayCart = {items: [], total: 0},
  //       total = 0;

  //   console.log('session cart: ' + cart);

  //   if (!cart) {
  //     res.json({ message: 'Your cart is empty! (2a)' });
  //     return;
  //   }

  //   // Display products in session's cart
  //   for (var item in cart) {
  //     if (cart[item] != null)
  //     {
  //       displayCart.items.push(cart[item]);
  //       total += (cart[item].qty * cart[item].price);
  //     }
  //   }

  //   if (total == 0)
  //   {
  //     res.json({ message: 'Your cart is empty! (2b)' });
  //     return;
  //   }

  //   req.session.total = displayCart.total = total.toFixed(2);

  //   res.json({ message: displayCart });
  // });

  /**
    * Adds an item to the shopping cart
    */
//   router.post('/add', loadCartFromDB, function (req, res) {
//     //Load (or initialize) the cart
//     req.session.cart = req.session.cart || {};
//     var cart = req.session.cart;

//     //Read the incoming product data
//     var id = req.param('item_id');

//     //Locate the product to be added
//     productModel.findById(id, function (err, prod) {
//       if (err) {
//         console.log('Error adding product to cart: ', err);
//         res.json({ message: 'Error adding product to cart: ' + err });
//         return;
//       } else if (id == null || prod == null) {
//         res.json({ message: 'Product not found' });
//         return;
//       } else if (prod.stock <= 0) {
//         res.json({ message: 'Out of stock'});
//         return;
//       }

//       //Add or increase the product quantity in the shopping cart.
//       if (cart[id]) {
//         cart[id].qty++;
//       }
//       else {
//         cart[id] = {
//           name: prod.name,
//           volume: prod.volume,
//           prettyVolume: prod.prettyVolume(),
//           price: prod.price,
//           prettyPrice: prod.prettyPrice(),
//           qty: 1
//         };
//       }

// //       var newCart = new cartModel({ username: req.user.local.email, items: cart });

//       updateDBCart(req, cart, prod);

// /*       var query = {
//         username: req.user.local.email,
//         item_id: id
//       };
//       var update = {
//         username: req.user.local.email,
//         name: prod.name,
//         volume: prod.volume,
//         prettyVolume: prod.prettyVolume(),
//         price: prod.price,
//         prettyPrice: prod.prettyPrice(),
//         qty: cart[id].qty
//       };
//       var options = { upsert: true };

//       cartModel.findOneAndUpdate(query, update, options, function(err, updateCart) {
//         if(err) {
//           console.log('Update cart error', err);
//         }

//         console.log(updateCart);
//       }); */

//       res.json({ message: 'Item added' });

//     });
//   });

  /**
    * Deletes an item from the shopping cart
    */
  // router.delete('/one', function (req, res) {
  //   //Load (or initialize) the cart
  //   req.session.cart = req.session.cart || {};
  //   var cart = req.session.cart;

  //   //Read the incoming product data
  //   var id = req.param('item_id');

  //   //Remove or decrease the product quantity in the shopping cart.
  //   if (cart[id]) {
  //     cart[id].qty--;

  //     productModel.findById(id, function (err, prod) {
  //       if (err) {
  //         console.log('Error searching product: ', err);
  //         res.json({ message: 'Error searching product: ' + err });
  //         return;
  //       } else if (id == null || prod == null) {
  //         res.json({ message: 'Product not found' });
  //         return;
  //       }

  //       if (cart[id].qty <= 0) {
  //         // cart[id] = null;
  //         delete cart[id];

  //         removeFromDBCart(req, id);
  //       } else {
  //         updateDBCart(req, cart, prod);
  //       }
  //     });

  //     res.json({ message: 'Item removed from cart' });
  //   } else {
  //     res.json({ message: 'Item does not exist in cart' });
  //   }
  // });

  // /**
  //   * Clears the cart entirely
  //   */
  // router.delete('/all', function (req, res) {
  //   //Load (or initialize) the cart
  //   req.session.cart = {};

  //   removeAllFromDBCart(req);

  //   res.json({ message: 'All items removed from cart' });
  // });
};

// function loadCartFromDB(req, res, next) {
//   if (!checkUserAuthenticated(req)) {
//     return next();
//   }

//   // Try to retrieve cart from database from previous session
//   userCarts.find({ 'username': req.user.local.email }, function(err, retrievedCart) {
//     console.log('new cart 222: ' + retrievedCart);

//     /*var displayCart = {items: [], total: 0},
//         total = 0;*/
//     var total = 0;

//     if (err) {
//       console.log(err);
//     }

//     if (req.session.cart) {
//       console.log('Session already has cart');
//       return next();
//     }

//     if (!retrievedCart) {
//       console.log('No cart found in DB');
//       return next();
//     }

//     /*if (retrieve) {
//       console.log('No cart info in DB');
//       return next();
//     }*/

//     // console.log('retrievedCart[0]: ' + retrievedCart[0]);

//     var newCart = {};
//     var retrievedCartItems = retrievedCart[0].cartItems;
//     console.log('retrievedCartItems: ' + retrievedCartItems);

//     // Query each item data and add to cart
//     for (var i = 0; i < retrievedCartItems.length; i++) {
//       /*var model =
//           {
//             name: retrievedCart[i].name,
//             volume: retrievedCart[i].volume,
//             prettyVolume: retrievedCart[i].prettyVolume,
//             price: retrievedCart[i].price,
//             prettyPrice: retrievedCart[i].prettyPrice,
//             qty: retrievedCart[i].qty
//           };*/

//       // displayCart.items.push(cartItems[i]);
//       total += (retrievedCartItems[i].qty * retrievedCartItems[i].price);

//       newCart[retrievedCartItems[i].item_id] = retrievedCartItems[i];

//       console.log('retrievedCartItems[' + i + ']: ' + JSON.stringify(retrievedCartItems[i], null, 1));
//     }

//     console.log('DB cart found');

//     console.log('newCart: ' + newCart);
//     // req.session.total = displayCart.total = total.toFixed(2);
//     req.session.total = total.toFixed(2);

//     req.session.cart_id = retrievedCart[0]._id;

//     req.session.cart = newCart;

//     return next();
//   });
// }

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
  // if user is authenticated in the session, carry on
  if (checkUserAuthenticated(req)) {
    return next();
  }

  // if they aren't redirect them to the home page
  res.redirect('../auth/unauth');
}

// simple function to check if user is authenticated in session
function checkUserAuthenticated(req) {
  if (req.isAuthenticated()) {
    return true;
  }

  return false;
}

function updateDBCart(req, cart, prod) {
if (!checkUserAuthenticated(req)) {
    return;
  }

  var id = req.param('item_id');

  /*console.log('cart: ' + JSON.stringify(cart));
  console.log('prod: ' + JSON.stringify(prod));
  console.log('id: ' + id);*/

  /*userCarts.find({ 'username': req.user.local.email, 'cartItems.items_id': id }, function(err, retrievedCart) {
    console.log('new cart 222: ' + retrievedCart);

    var displayCart = {items: [], total: 0},
        total = 0;
    var total = 0;

    if (err) {
      console.log(err);
    }

    if (req.session.cart) {
      console.log('Session already has cart');
      return next();
    }

    if (!retrievedCart) {
      console.log('No cart found in DB');
      return next();
    }

    /*if (retrieve) {
      console.log('No cart info in DB');
      return next();
    }*/

    // console.log('retrievedCart[0]: ' + retrievedCart[0]);

    /*var newCart = {};
    var retrievedCartItems = retrievedCart[0].cartItems;
    console.log('retrievedCartItems: ' + retrievedCartItems);*/

  userCarts.find({ 'username': req.user.local.email }, function(err, retrievedCart) {
  // cartModel2.find({ 'username': req.user.local.email, 'cartItems.items_id': id }, '-_id -username -__v', function (err, retrievedCart) {
    console.log('updateDBcart existing cart: ' + retrievedCart);

    var foundId;
    var retrievedCartItems = retrievedCart[0].cartItems;

    // Query each item data and try to find item ID
    for (var i = 0; i < retrievedCartItems.length; i++) {

      if(retrievedCartItems[i].item_id == id) {
        foundId = id;

        break;
      }
    }

    if(foundId != null) {
      var query2 = {
        'username': req.user.local.email,
        'cartItems.item_id': id
      };
      var update2 = {
        '$set': {
          'cartItems.$.name': prod.name,
          'cartItems.$.volume': prod.volume,
          'cartItems.$.prettyVolume': prod.prettyVolume(),
          'cartItems.$.price': prod.price,
          'cartItems.$.prettyPrice': prod.prettyPrice(),
          'cartItems.$.qty': cart[id].qty
        }
      };

      // userCart.update(query2, update2, function(err, updateCart) {
      cartModel2.update(query2, update2, function(err, updateCart) {
        console.log('updateCart with existing item 222: ' + updateCart);
      });
    } else {
      var cartItem = new cartItems();
      cartItem.item_id = id;
      cartItem.name = prod.name;
      cartItem.volume = prod.volume;
      cartItem.prettyVolume = prod.prettyVolume();
      cartItem.price = prod.price;
      cartItem.prettyPrice = prod.prettyPrice();
      cartItem.qty = cart[id].qty;

      var query2 = {
        'username': req.user.local.email,
      };
      var update2 = {
        '$push': {
          'cartItems': cartItem
        }
      };

      cartModel2.update(query2, update2, function(err, updateCart) {
        console.log('updateCart with new item 222: ' + updateCart);
      });
    }

    var productQuery = {
      '_id': id
    }
    var productUpdate = {
      '$inc': {
          'stock': -1
      }
    }

    /*productModel.update(productQuery, productUpdate, function(err, updateProduct) {
      console.log('updateCart subtract product stock: ' + updateProduct);
    });*/

    // var userCart = new userCarts();

    //if(retrievedCart == null || retrievedCart[0].length == 0) {
      /*var cartItem = new cartItems();
      cartItem.item_id = id;
      cartItem.name = prod.name;
      cartItem.volume = prod.volume;
      cartItem.prettyVolume = prod.prettyVolume();
      cartItem.price = prod.price;
      cartItem.prettyPrice = prod.prettyPrice();
      cartItem.qty = cart[id].qty;*/

      /*userCart.username = req.user.local.email;
      userCart.cartItems = cartItem;
//       console.log('debug: ' + cartModel2.schema);

      userCart.save(function(err, updateCart) {
        console.log('new cart 222: ' + updateCart);
      });*/

      /*var query2 = {
        'username': req.user.local.email,
      };
      var update2 = {
        '$push': {
          'cartItems': cartItem
        }
      };

      // userCart.update(query2, update2, function(err, updateCart) {
      cartModel2.update(query2, update2, function(err, updateCart) {
        console.log('updateCart with new item 222: ' + updateCart);
      });*/

    //} else {
      // var cartItem = new cartItems();
      // cartItem.item_id = id,
      // cartItem.name = prod.name,
      // cartItem.volume = prod.volume,
      // cartItem.prettyVolume = prod.prettyVolume(),
      // cartItem.price = prod.price,
      // cartItem.prettyPrice = prod.prettyPrice(),
      // cartItem.qty = cart[id].qty + 1

      /*var query2 = {
        'username': req.user.local.email,
        'cartItems.item_id': id
      };
      var update2 = {
        '$set': {
          'cartItems.$.name': prod.name,
          'cartItems.$.volume': prod.volume,
          'cartItems.$.prettyVolume': prod.prettyVolume(),
          'cartItems.$.price': prod.price,
          'cartItems.$.prettyPrice': prod.prettyPrice(),
          'cartItems.$.qty': cart[id].qty
        }
      };

      // userCart.update(query2, update2, function(err, updateCart) {
      cartModel2.update(query2, update2, function(err, updateCart) {
        console.log('updateCart with existing item 222: ' + updateCart);
      });*/
    //}
  });
}

// function removeFromDBCart(req, id) {
//   if (!checkUserAuthenticated(req)) {
//     return;
//   }

//   var query2 = {
//     'username': req.user.local.email,
//   };
//   var update2 = {
//     // 'username': req.user.local.email,
//     '$pull': {
//       'cartItems': {
//         'item_id': id
//       }
//     }
//   };

//   cartModel2.update(query2, update2, function(err, updateCart) {
//     if(err) {
//       console.log('Update cart error', err);
//     }

//     console.log('removeFromDBCart: ' + updateCart);
//   });

//   /*cartModel.remove(query, function(err, updateCart) {
//     if(err) {
//       console.log('Update cart error', err);
//     }

//     console.log('removeFromDBCart: ' + updateCart);
//   });*/
// }

// function removeAllFromDBCart(req) {
//   if (!checkUserAuthenticated(req)) {
//     return;
//   }

//   var query2 = {
//     'username': req.user.local.email,
//   };
//   var update2 = {
//     // 'username': req.user.local.email,
//     'cartItems': []
//   };

//   // userCart.update(query2, update2, function(err, updateCart) {
//   cartModel2.update(query2, update2, function(err, updateCart) {
//     if(err) {
//       console.log('Update cart error', err);
//     }

//     console.log('removeAllFromDBCart: ' + updateCart);
//   });

//   /*cartModel.remove(query, function(err, updateCart) {
//     if(err) {
//       console.log('Update cart error', err);
//     }

//     console.log('removeAllFromDBCart: ' + updateCart);
//   });*/
// }

function checkoutByPaypal(req, res) {
  paypal.payment.create(create_payment_json, function (err, payment) {
    if (err) {
      console.log(err);
      res.json({ message: err });
    } else {
      console.log("Create Payment Response");
      console.log(JSON.stringify(payment));

      var index, len;
      var links = payment.links;
      for (index = 0, len = links.length; index < len; index++) {
        if (links[index].rel == "approval_url") {
          res.redirect(links[index].href);
        }
      }

//       res.json({ message: payment });
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
