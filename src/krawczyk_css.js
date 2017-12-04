import * as rabin_ids from "./rabin_ids.js";
import * as shamir_pss from "./shamir_pss.js";
import * as salsa20 from "./salsa20.js";

/**
 * an implementation of Krawczyk's Computationally Secure Secret Sharing
 * http://courses.csail.mit.edu/6.857/2009/handouts/short-krawczyk.pdf
 * @constructor
 * @param {number} shares - the number of shares to construct (aka 'n')
 * @param {number} quorum - the number of shares necessary for reconstruction (aka 'k')
 * @param {function} random - a function that returns a random byte-value
 */
export function Configuration (shares, quorum, random) {
  this.rabin = new rabin_ids.Configuration(shares, quorum);
  this.shamir = new shamir_pss.Configuration(shares, quorum, random);
  const encode_node = (secret) => {
    'use strict';
    const crypto = require('crypto');
    const key = crypto.randomBytes(48);
    const cipher = crypto.createCipher('aes-256-gcm', new Buffer(key));
    const encrypted_secret = cipher.update(new Buffer(secret));
    cipher.final();
    const secret_shares = this.rabin.encode(encrypted_secret);
    const key_shares = this.shamir.encode(key);
    for (let i = 0; i < shares; i++) {secret_shares[i].key_data = key_shares[i];}
    return secret_shares;
  };
  const decode_node = (shs) => {
    'use strict';
    const crypto = require('crypto');
    const key_data = new Array(shs.length);
    for (let i = 0; i < shs.length; i++) {key_data[i] = shs[i].key_data;}
    const key = this.shamir.decode(key_data);
    const encrypted_text = this.rabin.decode(shs);
    const decipher = crypto.createDecipher('aes-256-gcm', new Buffer(key));
    const decrypted_text = decipher.update(new Buffer(encrypted_text));
    // the data is correct, but it says "unable to authenticate"
    // disable for now, investigate later
    // decipher.final();
    return decrypted_text;
  };
  const encode_fallback = (secret) => {
    'use strict';
    let key_nonce = new Uint8Array(40);
    for (let i = 0; i < 40; i++) {key_nonce[i] = Math.random();}
    const encrypted_secret = salsa20.code(key_nonce.slice(0,32), key_nonce.slice(32,40), secret);
    const shs = this.rabin.encode(encrypted_secret);
    const key_nonce_shares = this.shamir.encode(key_nonce);
    for (let i = 0; i < shares; i++) {shs[i].key_nonce_data = key_nonce_shares[i];}
    return shs;
  };
  const decode_fallback = (shs) => {
    'use strict';
    const key_nonce_data = new Array(shs.length);
    for (let i = 0; i < shs.length; i++) {key_nonce_data[i] = shs[i].key_nonce_data;}
    const key_nonce = this.shamir.decode(key_nonce_data);
    const encrypted_text = this.rabin.decode(shs);
    const decrypted_text = salsa20.code(key_nonce.slice(0,32), key_nonce.slice(32,40), encrypted_text);
    return decrypted_text;
  };
  if (typeof process !== 'undefined') {
    // we are probably in a node environment
    this.encode = encode_node;
    this.decode = decode_node;
  } else {
    // we are somewhere else
    this.encode = encode_fallback;
    this.decode = decode_fallback;
  }
}