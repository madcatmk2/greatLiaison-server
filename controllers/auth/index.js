'use strict';

var passport  = require('passport');
// var flash     = require('connect-flash');

var cartModel = require('../../models/cartModel');

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

  // process the login form
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

  // process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect : './profile', // redirect to the secure profile section
    failureRedirect : './signup', // redirect back to the signup page if there is an error
//     failureFlash : true // allow flash messages
  }));

  // =====================================
  // PROFILE SECTION =====================
  // =====================================
  // we will want this protected so you have to be logged in to visit
  // we will use route middleware to verify this (the isLoggedIn function)
  app.get('/profile', isLoggedIn, function(req, res) {

//     req.session.cart = loadCartFromDB(req);

    res.json({ message: 'Profile' });
/*     res.render('profile.ejs', {
      user : req.user // get the user out of session and pass to template
    }); */
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
  //   isLoggedIn : function(req, res, next) {

  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
  {
    return next();
  }

  // if they aren't redirect them to the home page
  res.redirect('./unauth');
}
