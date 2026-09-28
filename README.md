# SFMCAESEncryption

Encrypt a value in Node.js so that Salesforce Marketing Cloud (SFMC) can decrypt it with the AMPscript function `DecryptSymmetric`.

A typical use is encrypting a subscriber key outside SFMC, passing it in a CloudPage URL, and decrypting it in the page.

The repo has:

- a small Express service (`app3.js`) with a `POST /encrypt` endpoint,
- a CloudPage (`amp.html`) that decrypts a string with `DecryptSymmetric`, used to check the result,
- a few experiment scripts.

## Algorithm

When `DecryptSymmetric` is given a password, salt and IV as literal values, the Node code must derive the key and encrypt the same way. `app3.js` does it like this (following the approach in [this Salesforce StackExchange answer](https://salesforce.stackexchange.com/questions/384953/encrypt-in-marketing-cloud-decrypt-in-salesforce), which the code links to):

| Item | Value in code |
|---|---|
| Key derivation | PBKDF2, HMAC-SHA1, 1000 iterations, 32-byte (256-bit) key |
| PBKDF2 password | the password string (UTF-8) |
| PBKDF2 salt | the salt as a hex string, decoded to bytes (8 bytes, 16 hex chars) |
| Cipher | AES-256-CBC |
| IV | the IV as a hex string, decoded to bytes (16 bytes, 32 hex chars) |
| Padding | PKCS#7 (Node's default) |
| Plaintext encoding | UTF-8 |
| Output | Base64 of the ciphertext only (no IV or salt prepended) |

```js
const key = crypto.pbkdf2Sync(password, Buffer.from(salt, 'hex'), 1000, 32, 'sha1');
const cipher = crypto.createCipheriv('aes-256-cbc', key, Buffer.from(initVector, 'hex'));
```

`app.js` is an older version that does the same thing with `crypto-js` (`PBKDF2` with `algo.SHA1`, `keySize: 256/32`, `mode.CBC`, `pad.Pkcs7`). Both should give the same output for the same inputs.

The matching AMPscript call, as used in `amp.html`:

```
SET @plain = DecryptSymmetric(@enc, "aes", @null, "<your-password>", @null, "<your-salt-hex>", @null, "<your-iv-hex>")
```

The repo only covers one direction: encrypt in Node, decrypt in SFMC. It has no Node decrypt function and no `EncryptSymmetric` example.

## Setup

Requirements: Node.js with ES modules support (`"type": "module"` in `package.json`).

```bash
npm install
npm start          # runs node app3.js
```

Environment variables read by `app3.js`:

| Name | Purpose |
|---|---|
| `password` | PBKDF2 password |
| `salt` | 8-byte salt as 16 hex chars |
| `iv` | 16-byte IV as 32 hex chars |
| `PORT` | HTTP port, default `3000` |

Generate a salt and IV with:

```bash
openssl rand -hex 8    # salt
openssl rand -hex 16   # iv
```

Always set all three crypto env vars. The code falls back to hardcoded defaults if they are missing (see "Security notes").

To check the output in SFMC, paste `amp.html` into a CloudPage and publish it. The page shows a form with Password, Init Vector, Salt and Encrypted String fields and prints the decrypted value.

## Usage

```bash
curl -s -X POST http://localhost:3000/encrypt \
  -H 'Content-Type: application/json' \
  -d '{"sk":"<subscriber-key>"}'
# {"encryptedString":"<base64-ciphertext>"}
```

If `sk` is missing the service returns `400` with `{"error":"Subscriber Key (sk) not found in request"}`.

Note that the Base64 output can contain `+`, `/` and `=`. URL-encode it before putting it in a query string.

## Project structure

```
app3.js        Express service, Node crypto (the one npm start runs)
app.js         Earlier Express service, crypto-js version
app4.js        Script: random salt and IV, prints them and a sample ciphertext for testing in amp.html
app2.js        Web Crypto experiment (not working, see below)
amp.html       CloudPage form that decrypts with DecryptSymmetric
package.json
```

## Known limitations and security notes

- **Hardcoded defaults.** `app.js`, `app2.js`, `app3.js` and `amp.html` contain a default password, salt and IV, and comments in `app.js` and `app2.js` repeat them. `app.js` and `amp.html` also contain other test values. Treat all of them as public. Do not use them, and remove them from the code and git history.
- **Static IV.** One fixed IV is used for every value, so the same plaintext always gives the same ciphertext. Anyone who sees two links can tell whether they are for the same subscriber. This is how `DecryptSymmetric` with a literal IV works, so choose it knowingly.
- **No authentication.** `POST /encrypt` has no auth. Anyone who can reach the service can encrypt any value, which lets them create valid encrypted links.
- **Secrets in logs.** `app3.js` logs the password, salt and IV at startup, and logs every request payload. It also encrypts a sample string at startup.
- **`amp.html` is a public decrypt form.** It accepts the password, salt and IV from request parameters, prefills the form with the hardcoded defaults, and writes request values back into the page without encoding. Do not leave it published.
- **Key Management.** SFMC can store the password, salt and IV in Key Management and reference them by external key instead of passing literals. That is safer than literals in page code, but this repo does not show it.
- **`app2.js` does not work.** `hexStringToArrayBuffer()` uses `slice(i, 2)` instead of `slice(i, i + 2)`, so the salt is wrong. It also uses a random IV it never returns and outputs hex. Its output will not decrypt in SFMC.

## Authors

Matheswaran Kanagarajan (all commits).
