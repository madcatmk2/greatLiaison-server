'use strict';

var _ = require('underscore');
var Product = require('../../models/productModel');

module.exports = function(app) {

  /**
   * @api {get} /products Get products
   * @apiGroup products
   *
   * @apiDescription Retrieves a list of all the G&L products.
   * @apiSuccess {Object} products List of products.
   */
  app.get('/', function (req, res) {
    Product.find(function (err, products) {
      if (err) {
        console.log("GET /products error: " + err);
        return res.status(500).send('Server error');
      }

      res.json({
        success: true,
        products: products
      });
    });
  });

  /**
   * @api {get} /products/:productId Get product
   * @apiGroup products
   *
   * @apiParam {String} productId  Mongo product ID.
   *
   * @apiDescription Retrieves details about one product
   * @apiSuccess {Object} product Product details.
   */
  app.get('/:productId', function (req, res) {
    Product.findOne(
      { '_id': req.param('productId') },
      function (err, product) {
        if (err) {
          console.log("GET /products/:productId error: " + err);
          return res.status(500).send('Server error');
        }

        if (product) {
          res.json({
            success: true,
            product: product
          });
        } else {
          res.status(404).send('Product not found');
        }
    });
  });

  /**
   * @api {post} /products/ Add product
   * @apiGroup products
   *
   * @apiParam {String} sku  Product SKU.
   * @apiParam {String} name Product name in Chinese.
   * @apiParam {String} englishName Product english name.
   * @apiParam {String} categoryName Product category in Chinese.
   * @apiParam {String} categoryId Category ID.
   * @apiParam {String} description Product description, in HTML.
   * @apiParam {String} instructions Instructions for use.
   * @apiParam {String} size Product volume.
   * @apiParam {String} origin Product origin.
   * @apiParam {String} fullPrice Product's full price.
   * @apiParam {String} [salePrice] (Optional) Sale price, if exists.
   * @apiParam {String} [priceCurrency] Price currency; defaults to HKD.
   *
   * @apiDescription Adds a new product to the collection.
   * @apiSuccess {Object} product Returns the created product.
   */
  app.post('/', function (req, res) {
    var product = {
      sku: req.body.sku,
      name: req.body.name,
      englishName: req.body.englishName,
      categoryName: req.body.categoryName,
      categoryId: req.body.categoryId,
      description: req.body.description,
      instructions: req.body.instructions,
      size: req.body.size,
      origin: req.body.origin,
      fullPrice: req.body.fullPrice,
      salePrice: req.body.salePrice ? req.body.salePrice : '',
      priceCurrency: req.body.priceCurrency ? req.body.priceCurrency : 'HKD'
    };

    // Input checking
    var missingKeys = [];
    _.each(product, function(value, key) {
      if (key !== 'salePrice' && key !== 'priceCurrency' && !value) {
        missingKeys.push(key);
      }
    });

    if (missingKeys.length > 0) {
      return res.status(400).send('Params missing: ' + missingKeys);
    }

    var newProduct = new Product(product);
    newProduct.save(function(err, savedProduct) {
      if(err) {
        console.log("POST /products/ error: " + err);
        return res.status(500).send('Server error');
      }

      res.json({
        success: true,
        product: savedProduct
      });
    });
  });

  /**
   * @api {delete} /products/:productId Delete product
   * @apiGroup products
   *
   * @apiParam {String} productId  Product ID to delete.
   *
   * @apiDescription Deletes a product.
   * @apiSuccess {Object} product Product details.
   */
  app.delete('/:productId', function (req, res) {
    Product.remove({_id: req.param('productId')}, function (err, response) {
      if(err) {
        console.log("DELETE /products/ error: " + err);
        return res.status(500).send('Server error');
      }

      res.json({
        success: true,
        results: response.result
      });
    });
  });

  // TODO
  //
  // GET /products/categories => list of categoryIDs and names
  // GET /products/categories/:category_id
};
