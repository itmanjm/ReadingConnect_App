const functions = require('firebase-functions');

exports.api = functions.https.onRequest((req, res) => {
  res.send('API endpoint - Configure your API routes here');
});
