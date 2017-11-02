/*
this is a simple implementation of Rabin IDS;
code is mostly taken from the Java version:
https://github.com/Archistar/archistar-smc/blob/master/src/main/java/at/archistar/crypto/secretsharing/RabinIDS.java
*/
import * as gf256 from "./gf256.js";
import * as matrix from "./matrix.js";

// in accordance with the Java version, the secret is padded with zeroes
export function Configuration (shares, quorum) {
  this.multables = new Array(shares);
  for (let i = 0; i < shares; i++) {
    this.multables[i] = new Uint8Array(256);
    for (let j = 0; j < 256; j++) {
      this.multables[i][j] = gf256.mult(i + 1, j);
    }
  }
  this.encode = function (secret) {
    'use strict';
    const chunks = secret.length % quorum == 0 ? (secret.length / quorum) : Math.ceil(secret.length / quorum);
    const shs = new Array(shares);
    for (let k = 0; k < shares; k++) {
      shs[k] = {
        data: new Uint8Array(chunks),
        degree: k + 1,
        original_length: secret.length
      };
    }
    for (let x = 0; x < shares; x++) {
      const output = shs[x].data;
      const mult = this.multables[x];
      for (let i = quorum - 1; i < secret.length; i += quorum) {
        let res = secret[i]|0;
        for (let y = 1; y < quorum; y++) {
          res = (secret[(i - y)|0]|0) ^ (mult[res]|0);
        }
        output[Math.floor(i / quorum)] = res;
      }
      if (secret.length % quorum != 0) {
        let res = secret[secret.length - 1];
        for (let y = secret.length - 2; y >= secret.length - secret.length % quorum; y--) {
          res = secret[y] ^ mult[res];
        }
        output[Math.floor(secret.length / quorum)] = res;
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
