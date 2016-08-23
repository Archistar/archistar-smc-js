/*
an implementation of Krawczyk's Computationally Secure Secret Sharing
http://courses.csail.mit.edu/6.857/2009/handouts/short-krawczyk.pdf
*/
const krawczyk_css = module.exports;

krawczyk_css.Configuration = function (shares, quorum, random) {
  const rabin_ids = require('./rabin_ids.js');
  this.rabin = new rabin_ids.Configuration(shares, quorum);
  const shamir_pss = require('./shamir_pss.js');
  this.shamir = new shamir_pss.Configuration(shares, quorum, random);
  const salsa20 = require('./salsa20.js');
  this.encode = function (secret) {
    'use strict';
    let key_nonce = new Uint8Array(40);
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
  this.encode_webcrypto = function (secret) {
    'use strict';
    const r = this.rabin;
    const s = this.shamir;
    const key_iv = new Uint8Array(48);
    let k;
    return new Promise( function (resolve, reject) {
      window.crypto.subtle.generateKey(
        { name: "AES-GCM", length:256 }, true, ["encrypt","decrypt"]
      )
      .then(function(key) {
        k = key;
        return window.crypto.subtle.exportKey("raw", key);
      })
      .then(function(exported_key){
        key_iv.set(new Uint8Array(exported_key));
        key_iv.set(window.crypto.getRandomValues(new Uint8Array(16)), 32);
        return window.crypto.subtle.encrypt({
          name: "AES-GCM",
          iv: key_iv.slice(32,48)
        }, k, secret);
      })
      .then(function(encrypted_secret) {
        const shs = r.encode(new Uint8Array(encrypted_secret));
        const key_iv_shares = s.encode(key_iv);
        for (let i = 0; i < shares; i++) {
          shs[i].key_nonce_data = key_iv_shares[i];
        }
        resolve(shs);
      })
      .catch(function(e) { reject(e); });
    });
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

  this.decode_webcrypto = function (shs) {
    'use strict';
    const key_iv_data = new Array(shs.length);
    for (let i = 0; i < shs.length; i++) {
      key_iv_data[i] = shs[i].key_nonce_data;
    }
    const key_iv = this.shamir.decode(key_iv_data);
    const encrypted_text = this.rabin.decode(shs);
    return new Promise ( function (resolve, reject) {
      window.crypto.subtle.importKey(
        "raw",
        new Uint8Array(key_iv.slice(0,32)),
        "AES-GCM",
        false,
        ["encrypt", "decrypt"]
      )
      .then(function(key) {
        return window.crypto.subtle.decrypt(
          { name: "AES-GCM", iv: new Uint8Array(key_iv.slice(32,48)) },
          key,
          encrypted_text
        );
      })
      .then(function(decrypted_text) {
        resolve(decrypted_text);
      })
      .catch(function(e) { reject(e); });
    });
  };

};
