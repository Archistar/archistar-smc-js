import * as rabin_ids from "./rabin_ids.noasm.js";
import * as shamir_pss from "./shamir_pss.noasm.js";
import * as salsa20 from "./salsa20.noasm.js";
import * as rand from "./random.js";

/**
 * an implementation of Krawczyk's Computationally Secure Secret Sharing
 * http://courses.csail.mit.edu/6.857/2009/handouts/short-krawczyk.pdf
 * @constructor
 * @param {number} shares - the number of shares to construct (aka 'n')
 * @param {number} quorum - the number of shares necessary for reconstruction (aka 'k')
 * @param {function} random - a function that returns a random byte-value; if undefined, our own randomByte will be used
 */
export function Configuration (shares, quorum, random) {
  if (random === undefined) { random = rand.randomByte; }
  const rabin = new rabin_ids.Configuration(shares, quorum);
  const shamir = new shamir_pss.Configuration(shares, quorum, random);
  function encode (secret) {
    'use strict';
    let key_nonce = new Uint8Array(40);
    for (let i = 0; i < 40; i++) { key_nonce[i] = random(); }
    const encrypted_secret = salsa20.code(key_nonce.slice(0,32), key_nonce.slice(32,40), secret);
    const shs = rabin.encode(encrypted_secret);
    const key_nonce_shares = shamir.encode(key_nonce);
    for (let i = 0; i < shares; i++) {
      shs[i].key_nonce_data = key_nonce_shares[i];
    }
    return shs;
  }
  function decode (shs) {
    'use strict';
    const key_nonce_data = new Array(shs.length);
    for (let i = 0; i < shs.length; i++) {
      key_nonce_data[i] = shs[i].key_nonce_data;
    }
    const key_nonce = shamir.decode(key_nonce_data);
    const encrypted_text = rabin.decode(shs);
    const decrypted_text = salsa20.code(key_nonce.slice(0,32), key_nonce.slice(32,40), encrypted_text);
    return decrypted_text;
  }
  this.encode = encode;
  this.decode = decode;
}
