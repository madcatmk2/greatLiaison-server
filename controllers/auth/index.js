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
    res.json({ message: 'Profile' });
/*     res.render('profile.ejs', {
      user : req.user // get the user out of session and pass to template
    }); */
  });

  app.post('/profile/updateUserProfile', function(req, res) {
    var newUserData = new UserData();
    newUserData.username = req.user.local.email;
    newUserData.save(function(err) {
      if(err) {
        console.log('profile error', err);
      }

      res.json({ message: err });
    });
/*     var query = {
      username: req.user.local.email,
    };
    var update = {
      username: req.user.local.email,
      name: req.param("name"),
      volume: prod.volume,
      prettyVolume: prod.prettyVolume(),
      price: prod.price,
      prettyPrice: prod.prettyPrice(),
      qty: cart[id].qty
    };
    var options = { upsert: true };

    UserData.findOneAndUpdate(query, update, options, function(err, updateCart) {
      if(err) {
        console.log('Update cart error', err);
      }

      console.log(updateCart);
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

  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
  {
    return next();
  }

  // if they aren't redirect them to the home page
  res.redirect('./unauth');
}
