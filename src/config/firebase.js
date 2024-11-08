var admin = require('firebase-admin');

var serviceAccount = require('./assist-mate-3fbbf-firebase-adminsdk-htbjf-d19714a887.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
