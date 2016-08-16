/*
this is a simple implementation of Rabin IDS;
code is mostly taken from the Java version:
https://github.com/Archistar/archistar-smc/blob/master/src/main/java/at/archistar/crypto/secretsharing/RabinIDS.java
*/

var rabin_ids = module.exports;

const gf256 = require('./gf256.js');
const matrix = require('./matrix.js');

// random is a source that implements the functionality of window.crypto.getRandomValues()
// if it is undefined, window.crypto.getRandomValues() will be used
rabin_ids.Configuration = function (shares, quorum) {
  this.encode = function (secret) {
    'use strict';
    const chunks = Math.ceil(secret.length / quorum);
    const shs = [];
    for (let k = 0; k < shares; k++) {shs[k] = {data: [], degree: k + 1, original_length: secret.length};}
    let i = 0;

    for (let chunk = 0; chunk < chunks; chunk++) {
      const coeffs = [];
      for (let j = 0; j < quorum; j++) {
        if (secret[i] !== undefined) {
          coeffs[j] = secret[i];
          i++;
        } else {
          coeffs[j] = 0;
        }
      }
      for (let n = 0; n < shares; n++) {
        shs[n].data[chunk] = gf256.evaluateAt(coeffs, n + 1);
      }
    }

    return shs;
  };
  this.decode = function (shs) {
    'use strict';
    var xvalues = new Uint8Array(shs.length);
    for (let i0 = 0; i0 < shs.length; i0++) {xvalues[i0] = shs[i0].degree;}
    const decoder = matrix.generate_decoder(quorum, xvalues);
    let secret = [];
    const length = shs[0].data.length;
    const original_length = shs[0].original_length;
    for (let i = 0; i < length; i++) {
      const yvalues = [];
      for (let i2 = 0; i2 < quorum; i2++) {yvalues[i2] = shs[i2].data[i];}
      const decoded = matrix.multiply_vector(decoder, yvalues);
      if (secret.length + decoded.length < original_length) {
        secret = secret.concat(decoded);
      } else {
        for (let i1 = 0; secret.length < original_length; i1++) {
          secret.push(decoded[i1]);
        }
        break;
      }
    }
    return secret;
  };
};
