
// import { PBKDF2, AES, enc, mode, pad, algo } from 'crypto-js';
import CryptoJS from 'crypto-js';
const AES = CryptoJS.AES;
const PBKDF2 = CryptoJS.PBKDF2;
const enc = CryptoJS.enc;
const mode = CryptoJS.mode;
const pad = CryptoJS.pad;
const algo = CryptoJS.algo;

import bodyParser from 'body-parser';
import express from 'express';
const app = express();
app.use(bodyParser.json());
var jsonParser = bodyParser.json();
const port = process.env.PORT || 3000;
const password = process.env.password || 'fresh'
const initVector = process.env.iv || '4963b7334a46352623252955df21d7f3'
const salt = process.env.salt || 'e0cf1267f564b362'

// Encrypting the string using AES
// const encAES = encryptAES(str, password, salt, initVector);
// console.info('ENC AES', encAES);

// // Decrypting the encrypted string using AES
// const decAES = decryptAES(encAES, password, salt, initVector);
// console.info('DEC AES', decAES);

function buildKey(password, salt) {
return PBKDF2(password, enc.Hex.parse(salt), {
    keySize: 256 / 32,
    iterations: 1000,
    hasher: algo.SHA1,
});
}

function encryptAES(data, password, salt, initVector) {
return AES.encrypt(data, buildKey(password, salt), {
    iv: enc.Hex.parse(initVector),
    mode: mode.CBC,
    padding: pad.Pkcs7,
}).toString();;
}

function decryptAES(data, password, salt, initVector) {

return AES.decrypt(data, buildKey(password, salt), {
    iv: enc.Hex.parse(initVector),
    mode: mode.CBC,
    padding: pad.Pkcs7,
}).toString(enc.Utf8);
}


app.post('/encrypt', jsonParser, async(req,res) => {
    console.log('------------ /encrypt BEGIN ------------');
    let result = {}, encAES;
    let sk = req.body?.sk; 
    if(sk == undefined) {
        console.log('[/encrypt]: Bad request');
        result['error'] = 'Subscriber Key (sk) not found in request';
        res.status(400).send(result);
        return; 
    }
    
    encAES = encryptAES(sk, password, salt, initVector);
    result['encryptedString'] = encAES.toString();
    res.status(200).send(result);
});

app.listen(port, () => {
    console.log(`Generate SFMC AES Encryption App started on ${port}`);
  });


/* // import { PBKDF2, AES, enc, mode, pad, algo } from 'crypto-js';
// const cryptoJs = require('crypto-js')
const AES = require('crypto-js/aes'); 
const PBKDF2 = require('crypto-js/pbkdf2'); 
const enc = require('crypto-js/enc-hex');  //todo: mulitple enc available

const mode = require('crypto-js/mode-cfb');  // todo: mode CBC not found; 
// const pad = require('crypto-js/pad-pkcs7'); // PBKDF2
const algo = require('crypto-js/sha1'); // todo: there is not algo-sha1
const CryptoJS = require('crypto-js/')

const str = 'some@email.com';
const password = 'fresh'
const initVector = '4963b7334a46352623252955df21d7f3'
const salt = 'e0cf1267f564b362'
// const password = 'xyQ8n55tKi$@@4dy';
// const initVector = '198e3f0733ec4791';
// const salt = 'c2dc41eeab1e513a';

// Encrypting the string using AES
// const encAES = cryptoJs.AES.encrypt(str, password, salt, initVector);

console.log( CryptoJS.enc.Hex.parse(salt));
console.log( CryptoJS.SHA1);

const encAES = encryptAES(str, password, salt, initVector);
console.info('ENC AES', encAES.toString());


function buildKey(password, salt) {
    return CryptoJS.PBKDF2(password, CryptoJS.enc.Hex.parse(salt), {
      keySize: 256 / 32,
      iterations: 1000,
      hasher: CryptoJS.SHA1,
    });
  }

function encryptAES(data, password, salt, initVector) {
    return AES.encrypt(data, buildKey(password, salt), {
      iv: CryptoJS.enc.Hex.parse(initVector),
      mode: CryptoJS.mode.CBC,
      padding: pad.Pkcs7,
    }).toString();;
  }


// const sfmcEncAESStr = "zbbg0O+L8JWJvNDBI9Ic8Q=="

// const decAES = cryptoJs.AES.decrypt(sfmcEncAESStr, password, salt, initVector)

// console.info('DEC AES', decAES); 
*/