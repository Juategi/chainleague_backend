const express = require('express')
const fs = require('fs')
const https = require('https');
const request = require('request');
const helmet = require('helmet')
const compression = require('compression')
const bodyParser = require('body-parser')
const cors = require('cors')
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
const { Client, Webhook, resources } = require('coinbase-commerce-node');
const coinbaseSecret = '07ed1dbd-c14a-47e2-811f-cd343ca9a3c3';
Client.init(coinbaseSecret);

const { Charge } = resources;
const port = 5000;
const ico = {
  11: [0.0025, 2000000],
  12: [0.0030, 5000000],
  13: [0.0035, 7000000],
  14: [0.0040, 9000000],
  21: [0.0045, 10000000],
  22: [0.0050, 11000000],
  23: [0.0055, 12000000],
  24: [0.0060, 13000000],
  31: [0.0065, 14000000],
  32: [0.0070, 15000000],
  33: [0.0075, 16000000],
  34: [0.0080, 17000000],
  41: [0.0085, 18000000],
  42: [0.0090, 19000000],
  43: [0.0095, 20000000],
  44: [0.0100, 21000000],
  51: [0.0105, 22000000],
  52: [0.0110, 23000000],
  53: [0.0115, 24000000],
  54: [0.0120, 25000000],
  61: [0.0125, 26000000],
  62: [0.0130, 27000000],
  63: [0.0135, 28000000],
  64: [0.0140, 28000000],
  71: [0.0145, 29000000],
  72: [0.0150, 29000000],
  73: [0.0155, 30000000],
}
const serviceAccount = require('./chain-league-8694bded13b2.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

const app = express()
app.use(cors());
app.use(compression())
app.use(helmet())
app.use(bodyParser.json({limit: '1gb'}))
app.use(
bodyParser.urlencoded({
    extended: true,
    limit: '1gb',
    parameterLimit:5000000000000
  })
)
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);

function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

const check = async (request, response) => {
    const {user} = request.headers;
    const chargeData = {
        name: 'Chain League',
        description:'Buy Chain League tokens, send the amount you want, you will receive the CLG tokens according to the value of the cryptocurrencies you send.',
        logo_url: 'https://res.cloudinary.com/commerce/image/upload/v1642528875/ty54qczfmrbljolaz38w.png',
        pricing_type: 'no_price',
        metadata: {
          user: user,
        },
      };
  
    const charge = await Charge.create(chargeData);  
    response.status(200).json(charge)
}

const be = async (req, response) => {
  /*const webhookSecret = 'b01ddab2-33ce-4e2a-8a38-f8872cc639cf';
  var signature = JSON.stringify(req.body).substring(13, 77)
  //signature = '22e9699501a59ba0e7e8a5968b01d966dd504040dd234e23a1ed520f0bf282e1'
  var rawBody = JSON.stringify(req.body).substring(88).replaceAll(':":{"', ':{\"') //.replaceAll('":""}}', '\"}}')
  rawBody = rawBody.replaceAll("\\", "")
  //var rawBodyP = JSON.stringify({"id":"00000000-0000-0000-0000-000000000000","scheduled_for":"2018-01-01T00:30:00Z","attempt_number":1,"event":{"id":"00000000-0000-0000-0000-000000000000","resource":"event","type":"charge:pending","api_version":"2018-03-22","created_at":"2018-01-01T00:30:00Z","data":{"code":"AAAAAAAA","id":"00000000-0000-0000-0000-000000000000","resource":"charge","name":"The Sovereign Individual","description":"Mastering the Transition to the Information Age","hosted_url":"https://commerce.coinbase.com/charges/AAAAAAAA","created_at":"2018-01-01T00:00:00Z","expires_at":"2018-01-01T01:00:00Z","support_email":"test@test.test","timeline":[{"time":"2018-01-01T00:00:00Z","status":"NEW"},{"status":"PENDING","payment":{"network":"ethereum","transaction_id":"0x0000000000000000000000000000000000000000000000000000000000000000"},"time":"2018-01-01T00:30:00Z"}],"metadata":{},"payment_threshold":{"overpayment_Math.absolute_threshold":{"amount":"15.00","currency":"USD"},"overpayment_relative_threshold":"0.1","underpayment_Math.absolute_threshold":{"amount":"5.00","currency":"USD"},"underpayment_relative_threshold":"0.1"},"pricing":{"local":{"amount":"100.00","currency":"USD"},"bitcoin":{"amount":"1.00000000","currency":"BTC"},"ethereum":{"amount":"10.000000000","currency":"ETH"},"dai":{"amount":"10.000000000000000000","currency":"DAI"},"usdc":{"amount":"10.000000","currency":"USDC"},"bitcoincash":{"amount":"5.00000000","currency":"BCH"},"litecoin":{"amount":"2.00000000","currency":"LTC"}},"pricing_type":"fixed_price","payments":[{"network":"ethereum","transaction_id":"0x0000000000000000000000000000000000000000000000000000000000000000","status":"PENDING","detected_at":"2018-01-01T00:30:00Z","value":{"local":{"amount":"100.0","currency":"USD"},"crypto":{"amount":"10.00","currency":"ETH"}},"block":{"height":100,"hash":"0x0000000000000000000000000000000000000000000000000000000000000000","confirmations_accumulated":8,"confirmations_required":2}}],"addresses":{"bitcoin":"1000000000000000000000000000000000","ethereum":"0x0000000000000000000000000000000000000000","dai":"0x0000000000000000000000000000000000000000","usdc":"0x0000000000000000000000000000000000000000","litecoin":"3000000000000000000000000000000000","bitcoincash":"bitcoincash:000000000000000000000000000000000000000000"},"exchange_rates":{"BCH-USD":"1000.0","BTC-USD":"100.0","ETH-USD":"10.0","JPY-USD":"0.5","LTC-USD":"50.0","TST-USD":"0.5","BEER-USD":"0.1"},"local_exchange_rates":{"BCH-USD":"1000.0","BTC-USD":"100.0","ETH-USD":"10.0","JPY-USD":"0.5","LTC-USD":"50.0","TST-USD":"0.5","BEER-USD":"0.1"},"pwcb_only":false}}})
  var rawBodyF = JSON.stringify({"id":"00000000-0000-0000-0000-000000000000","scheduled_for":"2018-01-01T01:00:00Z","attempt_number":1,"event":{"id":"00000000-0000-0000-0000-000000000000","resource":"event","type":"charge:failed","api_version":"2018-03-22","created_at":"2018-01-01T01:00:00Z","data":{"code":"AAAAAAAA","id":"00000000-0000-0000-0000-000000000000","resource":"charge","name":"The Sovereign Individual","description":"Mastering the Transition to the Information Age","hosted_url":"https://commerce.coinbase.com/charges/AAAAAAAA","created_at":"2018-01-01T00:00:00Z","expires_at":"2018-01-01T01:00:00Z","support_email":"test@test.test","timeline":[{"time":"2018-01-01T00:00:00Z","status":"NEW"},{"status":"EXPIRED","time":"2018-01-01T01:00:00Z"}],"metadata":{},"payment_threshold":{"overpayment_Math.absolute_threshold":{"amount":"15.00","currency":"USD"},"overpayment_relative_threshold":"0.1","underpayment_Math.absolute_threshold":{"amount":"5.00","currency":"USD"},"underpayment_relative_threshold":"0.1"},"pricing":{"local":{"amount":"100.00","currency":"USD"},"bitcoin":{"amount":"1.00000000","currency":"BTC"},"ethereum":{"amount":"10.000000000","currency":"ETH"},"dai":{"amount":"10.000000000000000000","currency":"DAI"},"usdc":{"amount":"10.000000","currency":"USDC"},"bitcoincash":{"amount":"5.00000000","currency":"BCH"},"litecoin":{"amount":"2.00000000","currency":"LTC"}},"pricing_type":"fixed_price","payments":[],"addresses":{"bitcoin":"1000000000000000000000000000000000","ethereum":"0x0000000000000000000000000000000000000000","dai":"0x0000000000000000000000000000000000000000","usdc":"0x0000000000000000000000000000000000000000","litecoin":"3000000000000000000000000000000000","bitcoincash":"bitcoincash:000000000000000000000000000000000000000000"},"exchange_rates":{"BCH-USD":"1000.0","BTC-USD":"100.0","ETH-USD":"10.0","JPY-USD":"0.5","LTC-USD":"50.0","TST-USD":"0.5","BEER-USD":"0.1"},"local_exchange_rates":{"BCH-USD":"1000.0","BTC-USD":"100.0","ETH-USD":"10.0","JPY-USD":"0.5","LTC-USD":"50.0","TST-USD":"0.5","BEER-USD":"0.1"},"pwcb_only":false}}})
  var ranBodyC = JSON.stringify({"id":"00000000-0000-0000-0000-000000000000","scheduled_for":"2018-01-01T00:40:00Z","attempt_number":1,"event":{"id":"00000000-0000-0000-0000-000000000000","resource":"event","type":"charge:confirmed","api_version":"2018-03-22","created_at":"2018-01-01T00:40:00Z","data":{"code":"AAAAAAAA","id":"00000000-0000-0000-0000-000000000000","resource":"charge","name":"The Sovereign Individual","description":"Mastering the Transition to the Information Age","hosted_url":"https://commerce.coinbase.com/charges/AAAAAAAA","created_at":"2018-01-01T00:00:00Z","confirmed_at":"2018-01-01T00:40:00Z","expires_at":"2018-01-01T01:00:00Z","support_email":"test@test.test","timeline":{"{"time":"2018-01-01T00:00:00Z","status":"NEW"},{"status":"PENDING","payment":{"network":"ethereum","transaction_id":"0x0000000000000000000000000000000000000000000000000000000000000000"},"time":"2018-01-01T00:30:00Z"},{"status":"COMPLETED","payment":{"network":"ethereum","transaction_id":"0x0000000000000000000000000000000000000000000000000000000000000000"},"time":"2018-01-01T00:40:00Z"}":{"{"network":"ethereum","transaction_id":"0x0000000000000000000000000000000000000000000000000000000000000000","status":"CONFIRMED","detected_at":"2018-01-01T00:30:00Z","value":{"local":{"amount":"100.0","currency":"USD"},"crypto":{"amount":"10.00","currency":"ETH"}},"block":{"height":100,"hash":"0x0000000000000000000000000000000000000000000000000000000000000000","confirmations_accumulated":8,"confirmations_required":2}})
  */
  //var ranBodyC = JSON.stringify({"id":"00000000-0000-0000-0000-000000000000","scheduled_for":"2018-01-01T00:40:00Z","attempt_number":1,"event":{"id":"00000000-0000-0000-0000-000000000000","resource":"event","type":"charge:confirmed","api_version":"2018-03-22","created_at":"2018-01-01T00:40:00Z","data":{"code":"AAAAAAAA","id":"00000000-0000-0000-0000-000000000000","resource":"charge","name":"The Sovereign Individual","description":"Mastering the Transition to the Information Age","hosted_url":"https://commerce.coinbase.com/charges/AAAAAAAA","created_at":"2018-01-01T00:00:00Z","confirmed_at":"2018-01-01T00:40:00Z","expires_at":"2018-01-01T01:00:00Z","support_email":"test@test.test","timeline":[{"time":"2018-01-01T00:00:00Z","status":"NEW"},{"status":"PENDING","payment":{"network":"ethereum","transaction_id":"0x0000000000000000000000000000000000000000000000000000000000000000"},"time":"2018-01-01T00:30:00Z"},{"status":"COMPLETED","payment":{"network":"ethereum","transaction_id":"0x0000000000000000000000000000000000000000000000000000000000000000"},"time":"2018-01-01T00:40:00Z"}],"metadata":{},"payment_threshold":{"overpayment_absolute_threshold":{"amount":"15.00","currency":"USD"},"overpayment_relative_threshold":"0.1","underpayment_absolute_threshold":{"amount":"5.00","currency":"USD"},"underpayment_relative_threshold":"0.1"},"pricing":{"local":{"amount":"100.00","currency":"USD"},"bitcoin":{"amount":"1.00000000","currency":"BTC"},"ethereum":{"amount":"10.000000000","currency":"ETH"},"usdc":{"amount":"10.000000","currency":"USDC"},"litecoin":{"amount":"2.00000000","currency":"LTC"}},"pricing_type":"fixed_price","payments":[{"network":"ethereum","transaction_id":"0x0000000000000000000000000000000000000000000000000000000000000000","status":"CONFIRMED","detected_at":"2018-01-01T00:30:00Z","value":{"local":{"amount":"100.0","currency":"USD"},"crypto":{"amount":"10.00","currency":"ETH"}},"block":{"height":100,"hash":"0x0000000000000000000000000000000000000000000000000000000000000000","confirmations_accumulated":8,"confirmations_required":2}}],"addresses":{"bitcoin":"1000000000000000000000000000000000","ethereum":"0x0000000000000000000000000000000000000000","usdc":"0x0000000000000000000000000000000000000000","litecoin":"3000000000000000000000000000000000"},"exchange_rates":{"BCH-USD":"1000.0","BTC-USD":"100.0","ETH-USD":"10.0","JPY-USD":"0.5","LTC-USD":"50.0","TST-USD":"0.5","BEER-USD":"0.1"},"local_exchange_rates":{"BCH-USD":"1000.0","BTC-USD":"100.0","ETH-USD":"10.0","JPY-USD":"0.5","LTC-USD":"50.0","TST-USD":"0.5","BEER-USD":"0.1"},"pwcb_only":false}}})
  var conf = {"id":"00000000-0000-0000-0000-000000000000","scheduled_for":"2018-01-01T00:40:00Z","attempt_number":1,"event":{"id":"00000000-0000-0000-0000-000000000000","resource":"event","type":"charge:confirmed","api_version":"2018-03-22","created_at":"2018-01-01T00:40:00Z","data":{"code":"AAAAAAAA","id":"00000000-0000-0000-0000-000000000000","resource":"charge","name":"The Sovereign Individual","description":"Mastering the Transition to the Information Age","hosted_url":"https://commerce.coinbase.com/charges/AAAAAAAA","created_at":"2018-01-01T00:00:00Z","confirmed_at":"2018-01-01T00:40:00Z","expires_at":"2018-01-01T01:00:00Z","support_email":"test@test.test","timeline":[{"time":"2018-01-01T00:00:00Z","status":"NEW"},{"status":"PENDING","payment":{"network":"ethereum","transaction_id":"0x0000000000000000000000000000000000000000000000000000000000000000"},"time":"2018-01-01T00:30:00Z"},{"status":"COMPLETED","payment":{"network":"ethereum","transaction_id":"0x0000000000000000000000000000000000000000000000000000000000000000"},"time":"2018-01-01T00:40:00Z"}],"metadata":{},"payment_threshold":{"overpayment_absolute_threshold":{"amount":"15.00","currency":"USD"},"overpayment_relative_threshold":"0.1","underpayment_absolute_threshold":{"amount":"5.00","currency":"USD"},"underpayment_relative_threshold":"0.1"},"pricing":{"local":{"amount":"100.00","currency":"USD"},"bitcoin":{"amount":"1.00000000","currency":"BTC"},"ethereum":{"amount":"10.000000000","currency":"ETH"},"usdc":{"amount":"10.000000","currency":"USDC"},"litecoin":{"amount":"2.00000000","currency":"LTC"}},"pricing_type":"fixed_price","payments":[{"network":"ethereum","transaction_id":"0x0000000000000000000000000000000000000000000000000000000000000000","status":"CONFIRMED","detected_at":"2018-01-01T00:30:00Z","value":{"local":{"amount":"100.0","currency":"USD"},"crypto":{"amount":"10.00","currency":"ETH"}},"block":{"height":100,"hash":"0x0000000000000000000000000000000000000000000000000000000000000000","confirmations_accumulated":8,"confirmations_required":2}}],"addresses":{"bitcoin":"1000000000000000000000000000000000","ethereum":"0x0000000000000000000000000000000000000000","usdc":"0x0000000000000000000000000000000000000000","litecoin":"3000000000000000000000000000000000"},"exchange_rates":{"BCH-USD":"1000.0","BTC-USD":"100.0","ETH-USD":"10.0","JPY-USD":"0.5","LTC-USD":"50.0","TST-USD":"0.5","BEER-USD":"0.1"},"local_exchange_rates":{"BCH-USD":"1000.0","BTC-USD":"100.0","ETH-USD":"10.0","JPY-USD":"0.5","LTC-USD":"50.0","TST-USD":"0.5","BEER-USD":"0.1"},"pwcb_only":false}}}
  console.log(conf["event"]["data"]["metadata"]["user"])
  console.log(parseFloat(conf["event"]["data"]["payments"]["0"]["value"]["local"]["amount"]))
  console.log(conf["event"]["data"]["id"])
  try {
    /*const event = Webhook.verifyEventBody(rawBodyP, signature, webhookSecret);
    console.log(event.data.metadata)
    if (event.type === 'charge:pending') {
      //Probablemente nada
    }

    if (event.type === 'charge:confirmed') {
      var date = (new Date()).toISOString().replace("T", " ").substring(0, date.length - 5)
      // Averiguar compra
      // Crear pedido
      // Actualizar la fase y la inversion
    }

    if (event.type === 'charge:failed') {
      //Probablemente nada
    }
    */

    if (true) {
      // Averiguar compra y usuario y transaccion coinbase id
      var user = "llWpeR6CPQNM4UQq2MkZOVyOwys1"
      var usd = 16000
      var transaction_id = "1"
      
      // Checkear lock bucle
      var date = (new Date()).toISOString().replace("T", " ")
      date = date.substring(0, date.length - 5)
      var metaid = ""
      while(true){
        var snapshot = await db.collection("/metadev").limit(1).get();
        var meta = {}
        snapshot.forEach((doc) => {
          meta = doc.data()
          metaid = doc.id
        });
        if(meta['lock']){
          sleep(5000);
        }
        else{
          break;
        }
      }

      // Creamos un lock
      var metadoc = db.collection("/metadev").doc(metaid)
      metadoc.update(
        {
          "lock" : true
        }
      )
      // Cogemos la info meta
      var snapshot = await db.collection("/metadev").limit(1).get();
      var meta = {}
      snapshot.forEach((doc) => {
        meta = doc.data()
        metaid = doc.id
      });
      var clg_price = meta['clg_price']
      var userTokens = usd/clg_price
      var finalTokens = 0
      var phase = meta['phase']
      var phase_tokens = meta['phase_tokens']

      // Crear pedido
      doc_ref = db.collection("/ordersdev")
      if(userTokens + phase_tokens >= ico[phase][1]){
        //Primer order
        doc_ref.add({
            'state': "done",
            'transaction': transaction_id,
            'clg' :  Math.floor(Math.abs(ico[phase][1] - phase_tokens)),
            'clg_price' : clg_price,
            'user': user,
            "time" : date
        })
        finalTokens += Math.floor(Math.abs(ico[phase][1] - phase_tokens))
        var oldValue = Math.abs(ico[phase][1] - phase_tokens) * ico[phase][0]
        var newValue = usd - oldValue   
        i = Array.from(Object.keys(ico)).indexOf(phase.toString()) + 1; 
        phase = Array.from(Object.keys(ico))[i]
         
        phase_tokens = newValue / ico[phase][0]
        var skips = true                        
        while(skips){
            if(phase_tokens >= ico[phase][1]){
                //Crear nuevos orders
                doc_ref.add({
                    'state': "done",
                    'transaction': transaction_id,
                    'clg' : Math.floor(ico[phase][1]),
                    'clg_price': ico[phase][0],
                    'user': user,
                    'time': date ,
                })
                finalTokens += Math.floor(ico[phase][1])
                oldValue = ico[phase][1] * ico[phase][0]
                newValue = newValue - oldValue 
                i = Array.from(Object.keys(ico)).indexOf(phase.toString()) + 1;  
                phase = Array.from(Object.keys(ico))[i]
                 
                phase_tokens = newValue / ico[phase][0]
              }else{
                //Crear nuevos orders
                doc_ref.add({
                    'state': "done",
                    'transaction': transaction_id,
                    'clg' : Math.floor(phase_tokens),
                    'clg_price': ico[phase][0],
                    'user': user,
                    'time': date,
                })
                
                finalTokens += Math.floor(phase_tokens)
                skips = false   
      }}}else{
        phase_tokens = phase_tokens + userTokens
        //Primer order
        finalTokens = Math.floor(userTokens)       
        doc_ref.add({
          'state': "done",
          'transaction': transaction_id,
          'clg' :  Math.floor(userTokens),
          'clg_price' : clg_price,
          'user': user,
          "time" : date
      })
        
      }
    // Referral tokens
    var snapref = await db.collection('users').doc(user).get()
    var userRef = snapref.data();
    if (userRef['referal'] != ""){
        doc_ref.add({
            'state': "done",
            'transaction': "referral",
            'clg' : Math.floor(finalTokens/10),
            'user': userRef['referal'].substring(4),
            'time': date
        }) 
    }
     
    // Actualizar la fase y la inversion y cerrar lock
    metadoc.update({
        'invested': meta['invested'] + usd, 
        'phase' : phase,
        'phase_tokens' : Math.floor(phase_tokens),
        'clg_price' : ico[phase][0],
        'lock' : false
    })
  }

    //response.send(`success ${event.id}`);
    
  } catch (error) {
    //functions.logger.error(error);
    //response.status(400).send('failure!');
    console.log(error)
  }
  
}

const c = (req, response) => {
  const url ='http://62.43.69.155:5000/b'
  request.post({
    headers: {'content-type' : 'application/x-www-form-urlencoded'},
    url:     url,
    body:    req
  }, function (error, response, body) {
    console.log('error:', error); // console.log the error if one occurred 
    console.log('statusCode:', response && response.statusCode); // console.log the response status code if a response was received 
    console.log('body:', body); //console.logs the response of the request. 
  });
}

app.get('/a', check)
app.post('/b', be)
app.get('/c', c)
//const httpsServer = https.createServer(httpsOptions, app);
//httpsServer.listen(port, '62.43.69.155');
app.listen(port, () => {console.log(`App running on port ${port}.`)})


