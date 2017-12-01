import * as rabin_ids from "./rabin_ids.noasm.js";
import * as shamir_pss from "./shamir_pss.noasm.js";
import * as salsa20 from "./salsa20.js";

/*
an implementation of Krawczyk's Computationally Secure Secret Sharing
http://courses.csail.mit.edu/6.857/2009/handouts/short-krawczyk.pdf
*/
export function Configuration (shares, quorum, random) {
  this.rabin = new rabin_ids.Configuration(shares, quorum);
  this.shamir = new shamir_pss.Configuration(shares, quorum, random);
  this.encode = function (secret) {
    'use strict';
    let key_nonce = new Uint8Array(40);
    if (random !== undefined) {
      random(key_nonce);
    } else if (typeof crypto !== 'undefined') {
      crypto.getRandomValues(key_nonce);
    } else {
      const crypto = require('crypto');
      key_nonce = crypto.randomBytes(40);
    }
    const encrypted_secret = salsa20.code(key_nonce.slice(0,32), key_nonce.slice(32,40), secret);
    const shs = this.rabin.encode(encrypted_secret);
    const key_nonce_shares = this.shamir.encode(key_nonce);
    for (let i = 0; i < shares; i++) {
      shs[i].key_nonce_data = key_nonce_shares[i];
    }
    return shs;
  };
  this.decode = function (shs) {
    'use strict';
    const key_nonce_data = new Array(shs.length);
    for (let i = 0; i < shs.length; i++) {
      key_nonce_data[i] = shs[i].key_nonce_data;
    }
    const key_nonce = this.shamir.decode(key_nonce_data);
    const encrypted_text = this.rabin.decode(shs);
    const decrypted_text = salsa20.code(key_nonce.slice(0,32), key_nonce.slice(32,40), encrypted_text);
    return decrypted_text;
  };
}
