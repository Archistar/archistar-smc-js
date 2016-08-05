/*
implements Shamir Perfect Secret Sharing
*/

var shamir_pss = shamir_pss || {};

// random is a source that implements the functionality of window.crypto.getRandomValues()
// if it is undefined, window.crypto.getRandomValues() will be used
shamir_pss.Configuration = function (shares, quorum, random) {
  this.shares = shares;
  this.quorum = quorum;
  this.random = random;
  this.encode = function (secret) {
    'use strict';
    var shs = [];
    for (var k = 0; k < this.shares; k++) {shs[k] = {data: [], degree: k};}
    for (var i = 0; i < secret.length; i++) {
      var coeffs = [];
      coeffs.push(secret[i]);
      var rand0 = new Uint8Array(quorum - 1);
      if (this.random === undefined) {
        window.crypto.getRandomValues(rand0);
      } else {
        this.random(rand0);
      }
      coeffs = coeffs.concat(rand0);
      for (var n = 0; n < this.shares; n++) {
        shs[n].data[i] = gf256.evaluateAt(coeffs, n);
      }
    }
    return shs;
  };
  this.decode = function (shs) {
    'use strict';
    var xvalues = [];
    for (var i0 = 0; i0 < shs.length; i0++) {xvalues[i0] = shs[i0].degree;}
    var decoder = matrix.generate_decoder(this.quorum, xvalues);
    var secret = [];
    var length = shs[0].data.length;
    for (var i = 0; i < length; i++) {
      var yvalues = [];
      for (var i2 = 0; i2 < this.quorum; i2++) {yvalues[i2] = shs[i2].data[i];}
      var decoded = matrix.multiply_vector(decoder, yvalues);
      secret.push(decoded[0]);
    }
    return secret;
  };
};
