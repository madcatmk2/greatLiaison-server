# Great Liaison Online Store API Server

Great Liaison Limited sells health-care and skin-care products through their online shopping portal. This server houses all the product information for the website, and powers the shopping experience.

This server is developed in Node.js and constructed with help from the [KrakenJS framework](https://github.com/krakenjs/kraken-js). Most notably, it also uses the Paypal SDK to power transactions.

## Setup instructions
<em>see package.json for specific versions this app is built on</em>

1. Download and install Node.js (Developed on version 4.2.4)
2. Download and install MongoDB (DB version 3.2)
3. Download and install Redis (v3.0.7 or newer)
4. Download and install the latest [npm package installer](https://www.npmjs.com)
5. Setup a MongoDB database with the following: (note case IS sensitive)

* Database name: greatliaison
* Login user: greatliaison
* Password: abc123

6. Test the database login to ensure it authenticates
    mongo -u greatliaison -p abc123 --authenticationDatabase greatliaison

7. Navigate to the root of the project folder and run `npm install`. Run as sudo if prompted as necessary
8. Build API documentation and other tasks with `npm run build`.
9. Run the server in the root directory with `NODE_ENV=development node server.js`. Alternatively, you can use the npm scripts `npm start` (development) or `npm run prod-start` (production).
