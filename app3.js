import crypto from 'crypto'; 
import bodyParser from 'body-parser';
import express from 'express';
const app = express();
app.use(bodyParser.json());
var jsonParser = bodyParser.json();
const port = process.env.PORT || 3000;
let password = process.env.password || 'zoetis';
let initVector = process.env.iv || '3944a5680c2e80ef12adc728c0acc926'; // 16 bytes (128 bits)
let salt = process.env.salt || '2b8869f12dd9d562';

// initVector = crypto.randomBytes(16); // TODO: If needed;
console.log('salt: ' , salt)
console.log('password: ' , password)
console.log('IV: ' , initVector.toString('hex'))


let en = encryptAES('prasanna', password, salt, initVector)
console.log('EncrypteD: ' , en)

//https://salesforce.stackexchange.com/questions/384953/encrypt-in-marketing-cloud-decrypt-in-salesforce

function encryptAES(data, password, salt, initVector) {
    // Generate key
    const key = crypto.pbkdf2Sync(password, Buffer.from(salt, 'hex'), 1000, 32, 'sha1');

    // Create cipher
    const cipher = crypto.createCipheriv('aes-256-cbc', key, Buffer.from(initVector, 'hex'));

    // Encrypt data
    let encrypted = cipher.update(data, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    return encrypted;
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


// let en = encryptAES('SUCCESS!!!!!', password, salt, initVector)
// console.log('EncrypteD: ' , en)

// function encryptAES(data, password, salt, initVector) {
//     // Generate key
//     const key = crypto.pbkdf2Sync(password, salt, 1000, 32, 'sha1');

//     // Create cipher
//     const cipher = crypto.createCipheriv('aes-256-cbc', key, Buffer.from(initVector, 'hex'));

//     // Encrypt data
//     let encrypted = cipher.update(data, 'utf8', 'base64');
//     encrypted += cipher.final('base64');

//     return encrypted;
// }

// function buildKey(password, salt) {
//     return crypto.pbkdf2Sync(password, Buffer.from(salt, 'hex'), 1000, 32, 'sha1');
// }
