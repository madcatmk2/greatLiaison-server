'use strict';

/* NOTE TO HASON
 *
 * Let's define all the order-related API logic here. When I build the
 * front-end, I'll be using these endpoints. Let me know which routes you'll
 * have time to work on. Most of them should be refactoring the code you wrote
 * in backup/controllers_cart_index_old.js. If possible, don't commit any
 * commented out code so that we can keep the code legible for either of us.
 *
 * Feel free to add/modify endpoints if it makes sense. Note that the design
 * of these endpoints presumes that customers don't need to login/authenticate
 * in order to purchase. We'll add auth and user account info later.
 *
 * Each ORDER contains:
 * - Id
 * - Datetime of order
 * - Status (active / fulfilled / cancelled)
 * - List of items purchased (return full product information for each item)
 * - Customer information
 *    - Name
 *    - Shipping Address
 *    - Phone
 *    - Email
 * - Referrer (Full name of referrer)
 * - Payment information
 *    - Paypal Details? (Don't know the specifics that need to be saved)
 */

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
    res.status(404).send('To-do');
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
    res.status(404).send('To-do');
  });

  /**
   * @api {post} /orders Add an order
   * @apiGroup orders
   *
   * @apiParam {Object} customer Customer details.
   * @apiParam {Object} paypal Payment information.
   *
   * @apiDescription Creates a new order, with customer & payment information.
   * Should be invoked once the customer submits the order.
   *
   * @apiSuccess {Object} order Returns the completed order.
   */
  app.post('/', function(req, res) {
    /*
     * Shouldn't need to include the cart in the request body since cart is in
     * req.session
     */

    /*
     * Queue an email to sales@gll.com.hk, as well as transactional email
     * to customer.
     */

    /*
     * Should redirect to GET /orders/:orderId upon success, so that the
     * frontend can display orderId, email, etc as confirmation.
     */
    res.status(404).send('To-do');
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
};