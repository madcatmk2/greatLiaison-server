define({ "api": [
  {
    "type": "get",
    "url": "/profile",
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
  }
] });
