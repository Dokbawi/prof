let admin = require("firebase-admin");

let serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://basedb-e9ec1.firebaseio.com"
});

let db = admin.database();

module.exports.db = db;
