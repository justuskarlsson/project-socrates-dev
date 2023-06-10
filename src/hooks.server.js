import 'dotenv/config'

var admin = require("firebase-admin");

var serviceAccount = require("../secret/project-socrates-firebase-admin-sdk.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
