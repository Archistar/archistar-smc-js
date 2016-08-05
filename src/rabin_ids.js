/*
this is a simple implementation of Rabin IDS;
code is mostly taken from the Java version:
https://github.com/Archistar/archistar-smc/blob/master/src/main/java/at/archistar/crypto/secretsharing/RabinIDS.java
*/

var rabin_ids = rabin_ids || {};

// random is a source that implements the functionality of window.crypto.getRandomValues()
rabin_ids.Configuration = function (shares, quorum, random) {
  this.shares = shares;
  this.quorum = quorum;
  this.encode = function (secret) {
    'use strict';
    var chunks = Math.ceil(secret.length / this.quorum);
    var shs = [];
    for (var k = 0; k < this.shares; k++) {shs[k] = {data: [], degree: k, original_length: secret.length};}
    var i = 0;

    for (var chunk = 0; chunk < chunks; chunk++) {
      var coeffs = [];
      for (var j = 0; j < this.quorum; j++) {
        if (secret[i] !== undefined) {
          coeffs[j] = secret[i];
          i++;
        } else {
          var rand0 = new Uint8Array(1);
          random(rand0);
          coeffs[j] = rand0[0];
        }
      }
      for (var n = 0; n < this.shares; n++) {
        shs[n].data[chunk] = gf256.evaluateAt(coeffs, n);
      }
    }

    return shs;
  };
  this.decode = function (shs) {
    var xvalues = [];
    for (var i0 = 0; i0 < shs.length; i0++) {xvalues[i0] = shs[i0].degree;}
    var decoder = matrix.generate_decoder(this.quorum, xvalues);
    var secret = [];
    var length = shs[0].data.length;
    var original_length = shs[0].original_length;
    for (var i = 0; i < length; i++) {
      var yvalues = [];
      for (var i2 = 0; i2 < this.quorum; i2++) {yvalues[i2] = shs[i2].data[i];}
      var decoded = matrix.multiply_vector(decoder, yvalues);
      if (secret.length + decoded.length < original_length) {
        secret = secret.concat(decoded);
      } else {
        for (var i1 = 0; secret.length < original_length; i1++) {
          secret.push(decoded[i1]);
        }
        break;
      }
    }
    return secret;
  };
};
