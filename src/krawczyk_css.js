/*
an implementation of Krawczyk's Computationally Secure Secret Sharing
http://courses.csail.mit.edu/6.857/2009/handouts/short-krawczyk.pdf
*/
var krawczyk_css = krawczyk_css || {};

krawczyk_css.Configuration = function (shares, quorum, random) {
  this.shares = shares;
  this.quorum = quorum;
  this.random = random;
  this.rabin = new rabin_ids.Configuration(shares, quorum);
  this.shamir = new shamir_pss.Configuration(shares, quorum, random);
  this.encode = function (secret) {
    var key = new Uint32Array(8);
    window.crypto.getRandomValues(key);
    var nonce = new Uint32Array(2);
    window.crypto.getRandomValues(nonce);
    var encrypted_secret = salsa20.code(key, nonce, secret);
    var shs = this.rabin.encode(encrypted_secret);
    var key_data = new Uint8Array(40);
    for (var i0 = 0; i0 < 8; i0++) {
      key_data.set(salsa20.littleendian_rev(key[i0]), i0 * 4);
    }
    key_data.set(salsa20.littleendian_rev(nonce[0]), 32);
    key_data.set(salsa20.littleendian_rev(nonce[1]), 36);
    var key_data_shares = this.shamir.encode(key_data);
    for (var i = 0; i < this.shares; i++) {
      shs[i].key_data = key_data_shares[i];
    }
    return shs;
  };
  this.decode = function (shs) {
    var key_data = new Array(shs.length);
    for (var i = 0; i < shs.length; i++) {
      key_data[i] = shs[i].key_data;
    }
    var key_nonce = this.shamir.decode(key_data);
    var encrypted_text = this.rabin.decode(shs);
    var key = key_nonce.slice(0,32);
    var nonce = key_nonce.slice(32,40);
    var key32 = new Uint32Array(8);
    var nonce32 = new Uint32Array(2);
    for (var i0 = 0; i0 < 8; i0++) {
      key32[i0] = salsa20.littleendian(key[i0*4], key[i0*4+1], key[i0*4+2], key[i0*4+3]);
    }
    nonce32[0] = salsa20.littleendian(nonce[0], nonce[1], nonce[2], nonce[3]);
    nonce32[1] = salsa20.littleendian(nonce[4], nonce[5], nonce[6], nonce[7]);
    var decrypted_text = salsa20.code(key32, nonce32, encrypted_text);
    return decrypted_text;
  };
};
