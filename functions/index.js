const functions = require('firebase-functions');
const cors = require('cors')({ origin: '*' });
const request = require('request');
const { Client, Webhook, resources } = require('coinbase-commerce-node');
const coinbaseSecret = '07ed1dbd-c14a-47e2-811f-cd343ca9a3c3';
Client.init(coinbaseSecret);

const { Charge } = resources;

exports.createCharge = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    // TODO get real product data from database

    const chargeData = {
        name: 'Widget',
        description: 'Useless widget created by Fireship',
        //local_price: {
          //amount: 9.99,
          //currency: 'USD',
        //},
        pricing_type: 'no_price',
        metadata: {
          user: 'jeffd23',
        },
      };

    const charge = await Charge.create(chargeData);
    //console.log(charge);

    res.send(charge);
  });
});
//http://62.43.69.155:5000/chain-league/us-central1/webhookHandler
exports.webhookHandler = functions.https.onRequest(async (req, res) => {
  
  const url ='http://62.43.69.155:5000/b'
  console.log("raw: " + req.rawBody)
  //functions.logger.info("raw2:")
  request.post({
    headers: {'content-type' : 'application/x-www-form-urlencoded'},
    url:     url,
    body:    JSON.stringify({
      'sig' : req.headers['x-cc-webhook-signature'],
      'bod' : JSON.stringify(req.rawBody.toString('utf8'))
    })
  }, function (error, response, body) {
    console.log('error:', error); // Print the error if one occurred 
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
    console.log('body:', body); //Prints the response of the request. 
  });
  res.status(200).send("Success");
});