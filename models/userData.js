'use strict';

// load the things we need
var mongoose = require('mongoose');

// define the schema for our user  datamodel
var userDataSchema = mongoose.Schema({

  username       : String,
  personalInfo   : {
    givenName    : String,
    middleName   : String,
    familyName   : String,
    mobileNumber : Number
  },
  shippingInfo   : {
    fullName     : String,
    phoneNumber  : Number,
    address1     : String,
    address2     : String,
    city         : String,
    county       : String,
    postalCode   : String,
    country      : String
  }

});

// methods ======================
// create the model for user data and expose it to our app
module.exports = mongoose.model('UserData', userDataSchema);
