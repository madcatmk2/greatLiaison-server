define({ "api": [
  {
    "type": "get",
    "url": "/auth/profile",
    "title": "Get user profile",
    "name": "GetProfile",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Users unique ID.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "userData",
            "description": "<p>Profile data of the User.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "controllers/auth/index.js",
    "groupTitle": "User"
  },
  {
    "type": "post",
    "url": "/auth/login",
    "title": "Login endpoint",
    "name": "Login",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>User's login email.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>User's login password.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Redirect",
            "optional": false,
            "field": "webpage",
            "description": "<p>Login redirect to profile of the user.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "controllers/auth/index.js",
    "groupTitle": "User"
  },
  {
    "type": "post",
    "url": "/auth/signup",
    "title": "Signup endpoint",
    "name": "Signup",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>User's login email.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>User's login password.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Redirect",
            "optional": false,
            "field": "webpage",
            "description": "<p>Login redirect to profile of the user.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "controllers/auth/index.js",
    "groupTitle": "User"
  },
  {
    "type": "post",
    "url": "/auth/profile/updateUserProfile",
    "title": "Update user profile",
    "name": "UpdateUserProfile",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "givenName",
            "description": "<p>User's given name.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "middleName",
            "description": "<p>User's middle name.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "familyName",
            "description": "<p>User's family name.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "mobileNmber",
            "description": "<p>User's mobile number.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "fullName",
            "description": "<p>User's full name.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "phoneNumber",
            "description": "<p>User's phone number.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "address1",
            "description": "<p>User's address.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "address2",
            "description": "<p>User's additional address (if any).</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "city",
            "description": "<p>User's city of residence.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "county",
            "description": "<p>User's resident county.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "postalCode",
            "description": "<p>User's postal code.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "country",
            "description": "<p>User's country of residence.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "result",
            "description": "<p>Result of update.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "controllers/auth/index.js",
    "groupTitle": "User"
  }
] });
