e-commerce solution for Great Liaison

Setup instructions:

1) Download and install node.js
  - Developed on version 4.2.4

2) Download and install MongoDB
  - DB version 2.6.10

3) Download and install Redis (> v3.0.7)
  - needed for session store

4) Download and install the latest npm package installer
  - https://www.npmjs.com

5a) Setup a MongoDB database with the following: (note case IS sensitive)
  - Database name: greatliaison
  - Login user: greatliaison
  - Password: abc123

  - Should you want to change the password, please be reminded to update the login authentication in the source files of the project

5b) Test the database login to ensure it authenticates
  - mongo -u greatliaison -p abc123 --authenticationDatabase greatliaison

6) Navigate to the root of the project folder (greatLiaison/) and run npm install.  Run as sudo if prompted as necessary
  - This step downloads the node dependencies required in this project

(optional) 7) If user password is different from above, remember to update the file (greatLiaison/config/config.json) and change the DB user password field

8) Run the server in the root directory with the command:
  - node server.js
