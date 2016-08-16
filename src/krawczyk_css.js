/*
an implementation of Krawczyk's Computationally Secure Secret Sharing
http://courses.csail.mit.edu/6.857/2009/handouts/short-krawczyk.pdf
*/
var krawczyk_css = module.exports;

krawczyk_css.Configuration = function (shares, quorum, random) {
  const rabin_ids = require('./rabin_ids.js');
  this.rabin = new rabin_ids.Configuration(shares, quorum);
  const shamir_pss = require('./shamir_pss.js');
  this.shamir = new shamir_pss.Configuration(shares, quorum, random);
  const salsa20 = require('./salsa20.js');
  this.encode = function (secret) {
    'use strict';
    var key_nonce = new Uint8Array(40);
    if (random === undefined) {
      const randomBytes = require('randombytes');
      key_nonce = randomBytes(40);
    } else {
      random(key_nonce);
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
};
