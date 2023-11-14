// password - zoetis
// iv - b1b68fd39f804362469e8fbe3a85c3df
// salt - 2b8869f12dd9d562

let password = process.env.password || 'zoetis';
let initVector = process.env.iv || 'b1b68fd39f804362'; // 16 bytes (128 bits)
let salt = process.env.salt || '2b8869f12dd9d562';

import crypto from 'crypto'; 

function generateRandomBytes(length = 16) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return array;
}

initVector = generateRandomBytes();
console.log('initVector : ' , initVector);


(async () => {
    let x = await encryptAES('The quick brown fox', password, salt,initVector)
    console.log(x)

})();

async function encryptAES(data, password, salt, initVector) {
    // Convert the password, salt, and initVector to ArrayBuffer
    const passwordBuffer = new TextEncoder().encode(password);
    const saltBuffer = hexStringToArrayBuffer(salt);
    console.log('saltBuffer : ' , saltBuffer)
    const ivBuffer = generateIV();
    console.log('ivBuffer : ' , ivBuffer)

    // Import the password as a CryptoKey
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        passwordBuffer,
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );

    // Derive an AES key from the password
    const aesKey = await crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: saltBuffer,
            iterations: 1000,
            hash: "SHA-1"
        },
        keyMaterial,
        { name: "AES-CBC", length: 256 },
        false,
        ["encrypt"]
    );

    // Convert the data to an ArrayBuffer and encrypt it
    const dataBuffer = new TextEncoder().encode(data);
    const encrypted = await crypto.subtle.encrypt(
        {
            name: "AES-CBC",
            iv: ivBuffer
        },
        aesKey,
        dataBuffer
    );

    // Convert the encrypted data to a hex string
    return arrayBufferToHexString(encrypted);
}

function hexStringToArrayBuffer(hexString) {
    const result = new Uint8Array(hexString.length / 2);
    for (let i = 0, j = 0; i < hexString.length; i += 2, j++) {
        result[j] = parseInt(hexString.slice(i, 2), 16);
    }
    return result;
}

function generateIV() {
    const iv = new Uint8Array(16); // 16 bytes for 128 bits
    console.log('Generate IV ' , iv)
    return crypto.getRandomValues(iv);
}


function arrayBufferToHexString(buffer) {
    return Array.prototype.map.call(new Uint8Array(buffer), x => x.toString(16).padStart(2, '0')).join('');
}


// /**
//  * Encrypts text using AES-128-CBC and returns base64 encoded ciphertext
//  * @param {string} text - The text to be encrypted
//  * @param {string} key - The AES key (must be 128 bits)
//  * @param {string} iv - The initialization vector (must be 128 bits)
//  * @returns {string} - Base64 encoded ciphertext
//  */
// function encryptAES(text, key, iv) {
//     // Ensure the key and IV are of correct length
//     if (key.length !== 16 || iv.length !== 16) {
//         throw new Error('Key and IV must be 16 characters long for AES-128-CBC.');
//     }

//     // Create cipher
//     const cipher = crypto.createCipheriv('aes-128-cbc', Buffer.from(key), Buffer.from(iv));
    
//     // Encrypt and concatenate with the IV
//     let encrypted = cipher.update(text, 'utf8', 'base64');
//     encrypted += cipher.final('base64');

//     return encrypted;
// }

// // Example usage
// let key = crypto.randomBytes(16); // Replace with your 128-bit key
// let iv = crypto.randomBytes(16);   // Replace with your 128-bit IV
// let textToEncrypt = 'Hello, World!';

// // key = password;
// // iv = initVector;
// console.log('Key : ' , key.toString('hex'))
// console.log('iv : ' , iv.toString('hex'))
// console.log('textToEncrypt : ' , textToEncrypt)


// const encryptedText = encryptAES(textToEncrypt, key, iv);
// console.log('Encrypted: ', encryptedText);


// import crypto from 'crypto'; 

// function encryptAES(text, secretKey) {
//     // Ensure the key is 256-bit (32 characters)
//     let key = crypto.createHash('sha256').update(String(secretKey)).digest('base64').substr(0, 32);
    
//     // The initialization vector (iv) should be unique and not reused
//     let iv = crypto.randomBytes(16);

//     // Create a cipher
//     let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);

//     // Encrypt the text
//     let encrypted = cipher.update(text);
//     encrypted = Buffer.concat([encrypted, cipher.final()]);

//     // Combine the iv and the encrypted text
//     let encryptedData = iv.toString('hex') + ':' + encrypted.toString('hex');

//     return encryptedData;
// }

// // Example usage
// let secretKey = 'your-secret-key'; // Replace with your 256-bit key
// let textToEncrypt = 'Hello, World!';

// let encryptedText = encryptAES(textToEncrypt, secretKey);
// console.log('Encrypted:', encryptedText);
