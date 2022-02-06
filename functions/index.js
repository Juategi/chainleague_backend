const functions = require('firebase-functions');
//const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
//const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: '*' });
const request = require('request');
const { Client, Webhook, resources } = require('coinbase-commerce-node');
const coinbaseSecret = '07ed1dbd-c14a-47e2-811f-cd343ca9a3c3';
const { Charge } = resources;

Client.init(coinbaseSecret);


exports.createCharge = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const {user} = req.headers;
    const chargeData = {
        name: 'Chain League',
        description: 'Buy Chain League tokens, send the amount you want, you will receive the CLG tokens according to the value of the cryptocurrencies you send.',
        logo_url: 'https://res.cloudinary.com/commerce/image/upload/v1642528875/ty54qczfmrbljolaz38w.png',
        pricing_type: 'no_price',
        metadata: {
          user: user,
        },
      };
  
    const charge = await Charge.create(chargeData);
    res.status(200).json(charge)
  });
});

webhookHandler = functions.https.onRequest(async (req, res) => {
  
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


exports.finalwebhookHandler = functions.https.onRequest(async (req, res) => {
  //initializeApp();
  //const db = getFirestore();
  admin.initializeApp();
  var db = admin.firestore();
  function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
  }
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
  try {
    var test = false
    var ordersenv = "/orders"
    var metaenv = "/meta"
    if(test){
      ordersenv = "/ordersdev"
      metaenv = "/metadev"
    }
    const webhookSecret = 'b01ddab2-33ce-4e2a-8a38-f8872cc639cf';
    var rawBody = req.body
    const event = Webhook.verifyEventBody(req.rawBody, req.headers['x-cc-webhook-signature'], webhookSecret);
    //console.log(rawBody)
    var date = (new Date()).toISOString().replace("T", " ")
    date = date.substring(0, date.length - 5)
    doc_ref = db.collection(ordersenv)

    // Averiguar compra y usuario y transaccion coinbase id
    var user = rawBody["event"]["data"]["metadata"]["user"]
    var transaction_id = rawBody["event"]["data"]["code"]
    console.log("User " + user)
    console.log("id " + transaction_id)

    if (event.type === 'charge:pending') {    
      doc_ref.add({
        'state': "processing",
        'transaction': transaction_id,
        'user': user,
        "time" : date
    })

    }
    if (event.type === 'charge:failed') {
      // Actualizar a failed
      const snap = await doc_ref.where('transaction', '==', transaction_id).where('user', '==', user).get();
      snap.forEach(doc => {
        doc_ref.doc(doc.id).update({
          'state': "failed",
        })
      });
    }
    if (event.type === 'charge:confirmed') {  
      var usd = parseFloat(rawBody["event"]["data"]["payments"][0]["value"]["local"]["amount"])    
      console.log("Usd " + usd)

      // Borrar el pending
      const snap = await doc_ref.where('transaction', '==', transaction_id).where('user', '==', user).get();
      snap.forEach(doc => {
        doc_ref.doc(doc.id).delete()
      });

      // Checkear lock bucle
      var metaid = ""
      while(true){
        var snapshot = await db.collection(metaenv).limit(1).get();
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
      var metadoc = db.collection(metaenv).doc(metaid)
      metadoc.update(
        {
          "lock" : true
        }
      )
      // Cogemos la info meta
      var snapshot = await db.collection(metaenv).limit(1).get();
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
    try{
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

          doc_ref.add({
            'state': "done",
            'transaction': "referral",
            'clg' :  Math.floor(finalTokens/20),
            'user': user,
            "time" : date
        })
      }
    } catch (error) {
      console.log("error on referral")
    }
    
    // Actualizar la fase y la inversion y cerrar lock
    metadoc.update({
        'invested': meta['invested'] + usd, 
        'phase' : phase,
        'phase_tokens' : Math.floor(phase_tokens),
        'clg_price' : ico[phase][0],
        'lock' : false
    })

    console.log("All done!")
  }
    
  } catch (error) {
    res.status(400).send('failure!');
    console.log(error)
  }
  res.send(`success`);
});
