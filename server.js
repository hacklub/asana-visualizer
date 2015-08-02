var path = require('path');
var port = process.env.PORT || 8080;
var Asana = require('asana');
var express = require('express');
var cookieParser = require('cookie-parser');
var app = express();

// Middleware
// var bodyParser = require('body-parser');
// app.use(bodyParser.json());

var clientId = '43511055636261';
var clientSecret = 'f081b14c10d5d1ed524bf7618d870993';

// Create an Asana client. Do this per request since it keeps state that
// shouldn't be shared across requests.
function createClient() {
  return Asana.Client.create({
    clientId: clientId,
    clientSecret: clientSecret,
    redirectUri: 'http://localhost:' + port + '/oauth_callback'
  });
}

// Causes request cookies to be parsed, populating `req.cookies`.
app.use(cookieParser());
app.use('/client/node_modules', express.static(__dirname + '/node_modules'));
app.use('/client', express.static(__dirname + '/client'));

app.get('/', function(req, res) {
  var client = createClient();
  // If token is in the cookie, use it to show info.
  var token = req.cookies.token;
  if (token) {
    res.cookie(req.cookies);
    res.sendFile(path.join(__dirname,'client/index.html'))
  } else {
    // Otherwise redirect to authorization.
    res.redirect(client.app.asanaAuthorizeUrl());
  }
});

// Authorization callback - redirected to from Asana.
app.get('/oauth_callback', function(req, res) {
  var code = req.param('code');
  if (code) {
    // If we got a code back, then authorization succeeded.
    // Get token. Store it in the cookie and redirect home.
    var client = createClient();
    client.app.accessTokenFromCode(code).then(function(credentials) {
      // The credentials contain the refresh token as well. If you use it, keep
      // it safe on the server! Here we just use the access token, and store it
      // in the cookie for an hour.
      // Generally, if stored in a cookie it should be secure- and http-only
      // to prevent it from being stolen.
      res.cookie('token', credentials.access_token, { maxAge: 60 * 60 * 1000 });
      // Redirect back home, where we should now have access to Asana data.
      res.redirect('/');
    });
  } else {
    // Authorization could have failed. Show an error.
    res.end('Error getting authorization: ' + req.param('error'));
  }
});

// Start the server!
app.listen(port, function() {
  console.log("Listening on port " + port);
});

// =======================================================
// VISUALIZER BLOCK
// =======================================================

// /* Visualizer */
// var bodyParser = require('body-parser');
// app.use(bodyParser.json());
// app.post('/graph/data', function(req, res){
//   console.log(req.body);
//   return res.sendStatus(200);
// });
// app.get('/graph/data', function(req, res) {
//   console.log('replying with current topology');
//   res.send('hi');
// });
// app.get('/graph/viz', function(req, res) {
//   res.sendFile(path.join(__dirname,'../client/visualizer.html'));
// });

// app.use('/', express.static(path.join(__dirname,'/client')));
