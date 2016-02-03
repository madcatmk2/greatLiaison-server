'use strict';

var passport        = require('passport');
// var flash           = require('connect-flash');

var UserData        = require('../../models/userData');

module.exports = function (app) {
  require('./passport')(app);

  // =====================================
  // HOME PAGE ===========================
  // =====================================
  app.get('/', function(req, res) {
    res.json({ message: 'Authentication route' });
  });

  // =====================================
  // LOGIN ===============================
  // =====================================
  app.get('/login', function(req, res) {
    res.json({ message: 'Login' });
//     res.render('login.ejs', { message: req.flash('loginMessage') });
  });

  /**
   * @api {post} /auth/login Login endpoint
   * @apiName Login
   * @apiGroup User
   *
   * @apiParam {String} email User's login email.
   * @apiParam {String} password User's login password.
   *
   * @apiSuccess {Redirect} webpage Login redirect to profile of the user.
   */
  app.post('/login', passport.authenticate('local-login', {
    successRedirect : './profile', // redirect to the secure profile section
    failureRedirect : './login', // redirect back to the signup page if there is an error
//     failureFlash : true // allow flash messages
  }));

  // =====================================
  // SIGNUP ==============================
  // =====================================
  app.get('/signup', function(req, res) {
    res.json({ message: 'Signup' });
//     res.render('signup.ejs', { message: req.flash('signupMessage') });
  });

 /**
   * @api {post} /auth/signup Signup endpoint
   * @apiName Signup
   * @apiGroup User
   *
   * @apiParam {String} email User's login email.
   * @apiParam {String} password User's login password.
   *
   * @apiSuccess {Redirect} webpage Login redirect to profile of the user.
   */
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect : './profile', // redirect to the secure profile section
    failureRedirect : './signup', // redirect back to the signup page if there is an error
//     failureFlash : true // allow flash messages
  }));

 /**
   * @api {get} /auth/profile Get user profile
   * @apiName GetProfile
   * @apiGroup User
   *
   * @apiParam {String} id Users unique ID.
   *
   * @apiSuccess {Object} userData Profile data of the User.
   */
  app.get('/profile', isLoggedIn, function(req, res) {
    var query = {
      username: req.user.local.email,
    };
    UserData.find(query, '-_id -__v', function (err, userData) {
      if (err) {
        console.log(err);
      }

      res.json({ message: userData });
    });

//     res.json({ message: 'Profile' });
/*     res.render('profile.ejs', {
      user : req.user // get the user out of session and pass to template
    }); */
  });

  /**
   * @api {post} /auth/profile/updateUserProfile Update user profile
   * @apiName UpdateUserProfile
   * @apiGroup User
   *
   * @apiParam {String} givenName User's given name.
   * @apiParam {String} middleName User's middle name.
   * @apiParam {String} familyName User's family name.
   * @apiParam {String} mobileNmber User's mobile number.
   *
   * @apiParam {String} fullName User's full name.
   * @apiParam {String} phoneNumber User's phone number.
   * @apiParam {String} address1 User's address.
   * @apiParam {String} address2 User's additional address (if any).
   * @apiParam {String} city User's city of residence.
   * @apiParam {String} county User's resident county.
   * @apiParam {String} postalCode User's postal code.
   * @apiParam {String} country User's country of residence.
   *
   * @apiSuccess {String} result Result of update.
   */
  app.post('/profile/updateUserProfile', function(req, res) {
/*     console.log(req);
    console.log(req.params); */

    var query = {
      username: req.user.local.email,
    };
    var update = {
      'personalInfo.givenName': req.param('givenName'),
      'personalInfo.middleName': req.param('middleName'),
      'personalInfo.familyName': req.param('familyName'),
      'personalInfo.mobileNumber': req.param('mobileNumber'),

      'shippingInfo.fullName': req.param('fullName'),
      'shippingInfo.phoneNumber': req.param('phoneNumber'),
      'shippingInfo.address1': req.param('address1'),
      'shippingInfo.address2': req.param('address2'),
      'shippingInfo.city': req.param('city'),
      'shippingInfo.county': req.param('county'),
      'shippingInfo.postalCode': req.param('postalCode'),
      'shippingInfo.country': req.param('country')
    };
    var options = { upsert: true };

    UserData.findOneAndUpdate(query, update, options, function(err, updateUserData) {
      if(err) {
        console.log('Update user data error', err);
      }

      console.log(updateUserData);

      res.json({ message: 'Done' });
    });
  });

  // =====================================
  // LOGOUT ==============================
  // =====================================
  app.get('/logout', function(req, res) {
//     req.logout();
    res.redirect('/');
  });

  // =====================================
  // UNAUTHORIZED ========================
  // =====================================
  app.get('/unauth', function(req, res) {
    res.json({ message: 'Unauthorized user' });
  });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
  {
    return next();
  }

  // if they aren't redirect them to the home page
  res.redirect('./unauth');
}
