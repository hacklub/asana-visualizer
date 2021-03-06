var path = require('path');
var port = process.env.PORT || 8080;
var host; // filled in on first incoming request
var Asana = require('asana');
var express = require('express');
var cookieParser = require('cookie-parser');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

var Mailgun = require('mailgun').Mailgun;
var mailgunAPIKey = process.env.mailgunAPIKey;
var mailgun = new Mailgun(mailgunAPIKey);
function sendWithMailgun(email, callback) {
  mailgun.sendText(email.from, email.to, email.subject+' :mailgun', email.body, function (error) {
    callback(error, 200);
  });
}

var sendgrid  = require('sendgrid')(process.env.sendgridAPIKey);
function sendWithSendgrid(email, callback) {
  sendgrid.send({
    to:       email.to,
    from:     email.from,
    subject:  email.subject+' :sendgrid',
    text:     email.body
  }, function(error, success){
    var successStatusCode = success.message==='success' ? 200 : 0;
    callback(error, successStatusCode);
  });
}

// Environment/config variables
var prod = process.env.environment === 'production';
var asanaClientId = process.env.asanaClientId;
var asanaClientSecret = process.env.asanaClientSecret;

// Create an Asana client. Do this per request since it keeps state that
// shouldn't be shared across requests.
function createClient() {
  return Asana.Client.create({
    clientId: asanaClientId,
    clientSecret: asanaClientSecret,
    redirectUri: 'https://' + host + '/oauth_callback'
  });
}

// Causes request cookies to be parsed, populating `req.cookies`.
app.use(cookieParser());

// Fill in host on first incoming request
app.use('/', function (req, res, next) {
  if(!host) {
    host = req.headers.host.split(':')[0];
    console.log('I am https://'+host+':'+port+' running in '+process.env.environment+' mode.');
  }
  next();
})

// Client Resources
app.use('/client/node_modules', express.static(__dirname + '/node_modules'));
app.use('/client/bower_components', express.static(__dirname + '/bower_components'));
app.use('/client', express.static(__dirname + '/client'));

// Splash Page Resources
app.use('/splash/node_modules', express.static(__dirname + '/node_modules'));
app.use('/splash', express.static(__dirname + '/splash'));

////////////
// Routes //
////////////

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'splash/index.html'));
});

app.post('/email', function (req, res) {
  console.log('email submitted:',req.body.email);
  var email = {
    to:'hacklub@mail.com',
    from:'hacklub@mail.com',
    subject:'motivatr email submitted',
    body:req.body.email
  };
  var callback = function (errorStatusCode, successStatusCode) {
    if(errorStatusCode) {
      console.log('mail error', errorStatusCode);
      res.sendStatus(errorStatusCode)
    } else {
      console.log('mail success', successStatusCode);
      res.sendStatus(successStatusCode)
    }
  }

  // sendWithSendgrid(email, callback)
  sendWithMailgun(email, callback)
});

app.get('/app', function (req, res) {
  var client = createClient();
  // If token is in the cookie, use it to show info.
  var token = req.cookies.token;
  if(!prod) {
    token = 'test_token';
    req.cookies = 'token='+token+';';
  }
  if (token) {
    res.cookie(req.cookies);
    res.sendFile(path.join(__dirname,'client/index.html'))
  } else {
    // Otherwise redirect to authorization.
    res.redirect(client.app.asanaAuthorizeUrl());
  }
});

// Authorization callback - redirected to from Asana.
app.get('/oauth_callback', function (req, res) {
  var code = req.param('code');
  if (code) {
    // If we got a code back, then authorization succeeded.
    // Get token. Store it in the cookie and redirect home.
    var client = createClient();
    client.app.accessTokenFromCode(code).then(function (credentials) {
      // The credentials contain the refresh token as well. If you use it, keep
      // it safe on the server! Here we just use the access token, and store it
      // in the cookie for an hour.
      // Generally, if stored in a cookie it should be secure- and http-only
      // to prevent it from being stolen.
      res.cookie('token', credentials.access_token, { maxAge: 60 * 60 * 1000 });
      // Redirect back home, where we should now have access to Asana data.
      res.redirect('/app');
    });
  } else {
    // Authorization could have failed. Show an error.
    res.end('Error getting authorization: ' + req.param('error'));
  }
});

// Start the server!
app.listen(port, function () {
  console.log("Server listening on port " + port);
});
