'use strict';

/*
 * Set permissive CORS header - this allows this server to be used only as
 * an API server
 */
module.exports = function () {
  return function(req, res, next) {
    var address = req.app.kraken.get('addresses:frontend:host') + ':' +
                  req.app.kraken.get('addresses:frontend:port');

    res.setHeader('Access-Control-Allow-Origin', address);
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers',
      'Origin, Content-Type, Accept, Accept-Encoding');

    next();
  };
};
