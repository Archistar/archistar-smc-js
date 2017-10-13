/*
this is a simple implementation of Rabin IDS;
code is mostly taken from the Java version:
https://github.com/Archistar/archistar-smc/blob/master/src/main/java/at/archistar/crypto/secretsharing/RabinIDS.java
*/
import * as gf256 from "./gf256.js";
import * as matrix from "./matrix.js";

// in accordance with the Java version, the secret is padded with zeroes
export function Configuration (shares, quorum) {
  this.encode = function (secret) {
    'use strict';
    const chunks = Math.ceil(secret.length / quorum);
    const shs = new Array(shares);
    for (let k = 0; k < shares; k++) {shs[k] = {data: [], degree: k + 1, original_length: secret.length};}
    let i = 0;

    const coeffs = new Uint8Array(quorum);
    for (let chunk = 0; chunk < chunks; chunk++) {
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
    const xvalues = new Uint8Array(shs.length);
    for (let i = 0; i < shs.length; i++) {xvalues[i] = shs[i].degree;}
    const decoder = matrix.generate_decoder(quorum, xvalues);
    const length = shs[0].data.length;
    const original_length = shs[0].original_length;
    const secret = new Uint8Array(original_length);
    for (let i = 0; i < length; i++) {
      const yvalues = new Uint8Array(quorum);
      for (let j = 0; j < quorum; j++) {yvalues[j] = shs[j].data[i];}
      const decoded = matrix.multiply_vector(decoder, yvalues);
      if ((i + 1) * quorum < original_length) {
        secret.set(decoded, i * quorum);
      } else {
        for (let k = 0; ((i * quorum) + k) < original_length; k++) {
          secret[(i * quorum) + k] = decoded[k];
        }
      }
    }
    return secret;
  };
}
