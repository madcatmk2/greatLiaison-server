/**
   * A very simple product editor
   */
'use strict';

var bignum = require('bignum');

var Product = require('../../models/productModel');

module.exports = function (app) {

  app.get('/', function (req, res) {
    res.json({ message: 'Product manipulation' });
  });

  /**
     *  Retrieve a list of all products for editing.
     */
  app.get('/all', function (req, res) {

    Product.find(function (err, prods) {
      if (err) {
        console.log(err);
      }

//       var output = new Array(prods.length);
      var output = "";

      for (var i = 0; i < prods.length; i++) {
        var model =
            {
              name: prods[i].name,
              volume: prods[i].volume,
              prettyVolume: prods[i].prettyVolume(),
              price: prods[i].price,
              prettyPrice: prods[i].prettyPrice()
            };
        console.log(model);
//         output[i] = model;
        output = output + JSON.stringify(model, null, 0);
      }

      res.json({ message: 'All products: ' + output });
    });

  });

  /**
     *  Retrieves a specific product for editing.
     */
  app.get('/oneProduct', function (req, res) {

    Product.findOne({ '_id': req.param('item_id') }, function (err, prod) {
      if (err) {
        console.log(err);
      }

      var model =
          {
            name: prod.name,
            volume: prod.volume,
            price: prod.price
          };

      res.json({ message: 'Searched product: ' + JSON.stringify(model, null, 1) });
    });

  });


  /**
     * Add a new product to the database.
     */
  app.post('/add', function (req, res) {
    var name = req.body.name && req.body.name.trim();

    var volume = parseInt(req.body.volume);

//     var price = parseFloat(req.body.price, 10);
    var price = bignum(req.body.price, 10);

    //Some very lightweight input checking
    if (name === '' || isNaN(price) || isNaN(volume)) {
      res.redirect('/products#BadInput');
      return;
    }

    var newProduct = new Product({name: name, volume: volume, price: price});

    //Show it in console for educational purposes...
    newProduct.whatAmI();

    /* The call back recieves to more arguments ->product/s that is/are added to the database
	   and number of rows that are affected because of save, which right now are ignored
	   only errors object is consumed*/
    newProduct.save(function(err) {
      if(err) {
        console.log('save error', err);
      }

      res.redirect('/products');
    });
  });

  /**
     * Delete a product.
     * @param: req.body.item_id Is the unique id of the product to remove.
     */
  app.delete('/delete', function (req, res) {
    Product.remove({_id: req.body.item_id}, function (err) {
      if (err) {
        console.log('Remove error: ', err);
      }
      res.redirect('/products');
    });
  });


  /**
     * Edit a product.
     * Not implemented here
     */
  app.put('/products', function (req, res) {
    console.log('PUT received. Ignoring.');
    res.redirect('/products');
  });

};
