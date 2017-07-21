const express = require('express');
var request = require('request');
var lib = require('telstrasmsmessagingapilib/lib');
const https = require('https');

const oAuthManager = lib.OAuthManager;
var controller = lib.SMSController;

const router = express.Router();

const errorTitle = 'An error occured!';
const _credentials = require('../api-credentials');

lib.Configuration.oAuthClientId = _credentials.CLIENT_ID;
lib.Configuration.oAuthClientSecret = _credentials.CLIENT_SECRET;

lib.Configuration.oAuthTokenUpdateCallback = function (token) {
  console.log('new token', token);
};

// called on every request except for /token. Checks that the token is still valid before continuing with the request
router.use('/', function (req, res, next) {
  if (oAuthManager.isTokenSet()) {
    // token is already stored in the client
    // make API calls as required
    next();
  } else {
    const scopes = [lib.OAuthScopeEnum.SMS];
    const promise = oAuthManager.authorize(scopes);
    promise.then((success) => {
      // client authorized. API calls can be made
      next();
  }, (exception) => {
      // error occurred, exception will be of type lib/Exceptions/OAuthProviderException
      lib.Configuration.oAuthToken = null;
      return res.status(exception.errorCode).json({
        title: `${exception.errorCode} - ${errorTitle}`,
        message: exception.errorMessage
      });
    });
  }
});

// sends the SMS object passed in the req.body
router.post('/send', function (req, res, next) {
    var post_options = {
      host: 'slot2.apipractice.t-dev.telstra.net',
      port: '443',
      path: '/v2/messages/sms',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + lib.Configuration.oAuthToken.accessToken,
        'Content-Type': 'application/json'
      }
    };

  // Set up the request
  var post_req = https.request(post_options, (res) => {
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      console.log('Response: ' + chunk);
    });
  });

  // post the data
  post_req.write(JSON.stringify(req.body));
  post_req.end();

  res.status(200);
});

// polls the message with messageId
router.get('/status/:messageId', function (req, res, next) {
    controller.getMessageStatus(req.params.messageId, function (error, response, context) {
        if (error) {
            return res.status(error.errorCode).json({
                title: `${error.errorCode} - ${errorTitle}`,
                message: error.errorMessage
            });
        }
        res.status(200).json({
            title: 'Success',
            obj: response
        });
    });
});

module.exports = router;
