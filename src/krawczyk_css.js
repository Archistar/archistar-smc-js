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
    var key_nonce = new Uint8Array(40);
    window.crypto.getRandomValues(key_nonce);
    console.log(key_nonce);
    var encrypted_secret = salsa20.code(key_nonce.slice(0,32), key_nonce.slice(32,40), secret);
    var shs = this.rabin.encode(encrypted_secret);
    var key_nonce_shares = this.shamir.encode(key_nonce);
    for (var i = 0; i < this.shares; i++) {
      shs[i].key_nonce_data = key_nonce_shares[i];
    }
    return shs;
  };
  this.decode = function (shs) {
    var key_nonce_data = new Array(shs.length);
    for (var i = 0; i < shs.length; i++) {
      key_nonce_data[i] = shs[i].key_nonce_data;
    }
    var key_nonce = this.shamir.decode(key_nonce_data);
    var encrypted_text = this.rabin.decode(shs);
    var decrypted_text = salsa20.code(key_nonce.slice(0,32), key_nonce.slice(32,40), encrypted_text);
    return decrypted_text;
  };
};
