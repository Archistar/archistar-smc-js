/*
implements Shamir Perfect Secret Sharing
*/
import * as gf256 from "./gf256.js";
import * as matrix from "./matrix.js";

// random is a source that implements the functionality of window.crypto.getRandomValues()
// if it is undefined, window.crypto.getRandomValues() will be used
// quorum must be an int (not a Number; if it is, then the Uint8Array will be of length zero!)
export function Configuration (shares, quorum, random) {
  this.encode = function (secret) {
    'use strict';
    const shs = [];
    for (let k = 0; k < shares; k++) {shs[k] = {data: [], degree: k + 1};}
    for (let i = 0; i < secret.length; i++) {
      let coeffs = new Uint8Array(quorum);
      for (let i = 0; i < quorum; i++) {coeffs[i] = 0;}
      if (random === undefined) {
        const randomBytes = require('randombytes');
        coeffs = randomBytes(2);
      } else {
        random(coeffs);
      }
      coeffs[0] = secret[i];
      for (let n = 0; n < shares; n++) {
        shs[n].data[i] = gf256.evaluateAt(coeffs, n + 1);
      }
    }
    return shs;
  };
  this.decode = function (shs) {
    'use strict';
    const xvalues = [];
    for (let i0 = 0; i0 < shs.length; i0++) {xvalues[i0] = shs[i0].degree;}
    const decoder = matrix.generate_decoder(quorum, xvalues);
    const secret = [];
    const length = shs[0].data.length;
    for (let i = 0; i < length; i++) {
      const yvalues = [];
      for (let i2 = 0; i2 < quorum; i2++) {yvalues[i2] = shs[i2].data[i];}
      const decoded = matrix.multiply_vector(decoder, yvalues);
      secret.push(decoded[0]);
    }
    return secret;
  };
}
