const express = require('express');
var request = require('request');

const https = require('https');
const router = express.Router();


// sends the SMS object passed in the req.body
router.post('/send', function (req, res, next) {
    var post_options = {
      host: 'slot2.apipractice.t-dev.telstra.net',
      port: '443',
      path: '/v2/messages/sms',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer aaCH99mGv4sGozXr8PzxF63qZb8o',
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

  post_data = {
    "to": "+61411292236",
    "body": "test from hackathon",
    "from": "+61472880109",
    "validity": 0,
    "scheduleDelivery": 0,
    "notifyURL": "string",
    "replyRequest": true
  };

  // post the data
  post_req.write(JSON.stringify(post_data));
  post_req.end();
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
