/*
 * Set permissive CORS header - this allows this server to be used only as
 * an API server
 */
module.exports = function () {
  return function(req, res, next) {
    var domain, port;
    if (process.env.NODE_ENV === 'production') {
      domain = '108.218.104.23';
      port = '8090';
    } else {
      domain = 'localhost';
      port = '8090';
    }
    var host = 'http://' + domain + ':' + port;

    res.setHeader('Access-Control-Allow-Origin', host);
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers',
      'Origin, Content-Type, Accept, Accept-Encoding');

    next();
  };
};
