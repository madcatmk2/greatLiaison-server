'use strict';

var session = require('express-session'),
    RedisStore = require('connect-redis')(session);

/** Creates a REDIS-backed session store.
*
* @param {Object} [sessionConfig] Configuration options for express-session
* @param {Object} [redisConfig] Configuration options for connect-redis
* @returns {Object} Returns a session middleware which is backed by REDIS
*/
module.exports = function (sessionConfig, redisConfig) {

  // add the 'store' property to our session configuration
  sessionConfig.store = new RedisStore(redisConfig);

  // create the actual middleware
  return session(sessionConfig);
};
