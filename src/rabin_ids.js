/*
this is a simple implementation of Rabin IDS;
code is mostly taken from the Java version:
https://github.com/Archistar/archistar-smc/blob/master/src/main/java/at/archistar/crypto/secretsharing/RabinIDS.java
*/

var rabin_ids = rabin_ids || {};

rabin_ids.Configuration = function (shares, quorum) {
  this.shares = shares;
  this.quorum = quorum;
  this.encode = function (secret) {
    'use strict';
    var chunks = Math.ceil(secret.length / this.quorum);

    var shs = [];
    for (var k = 0; k < shares; k++) {shs[k] = [];shs.degree = k;}
    var coeffs = [];
    var i = 0;

    for (var chunk = 0; chunk < chunks; chunk++) {
      for (var j = 0; j < this.quorum; j++) {
          if (secret[i] !== undefined) {
            shs[j][chunk] = secret[i];
            coeffs[j] = secret[i];
            i++;
          } else {
            var rand = new Uint8Array(1);
            window.crypto.getRandomValues(rand);
            shs[j][chunk] = rand[0];
            coeffs[j] = rand[0];
          }
        }
      for (j; j < shares; j++) {
          shs[j][chunk] = gf256.evaluateAt(coeffs, j);
      }
    }
    return shs;
  };
};
