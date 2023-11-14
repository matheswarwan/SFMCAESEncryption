import crypto from 'crypto'; 
let password = 'anypasswordvalue';
let initVector = crypto.randomBytes(16); // 16 bytes (128 bits)
let salt = crypto.randomBytes(8); // 8 bytes (64 bits)

console.log('password: ' , password)
console.log('IV: ' , initVector.toString('hex'))
console.log('salt: ' , salt.toString('hex'))

let en = encryptAES('The quick brown fox jumps over the lazy dog! !@#$%^&*()_+', password, salt, initVector)
console.log('Encrypted Text: ' , en)

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