import * as gf256 from "./gf256.js";
import * as matrix from "./matrix.js";

/**
 * @constructor
 * @param {number} shares - the number of shares to construct (aka 'n')
 * @param {number} quorum - the number of shares necessary for reconstruction (aka 'k')
 * @param {function} random - a function that returns a random byte-value
 */
export function Configuration (shares, quorum, random) {
  this.encode = (random === undefined && typeof crypto !== 'undefined') ?
    function (secret) {
    'use strict';
    const shs = [];
    for (let k = 0; k < shares; k++) {shs[k] = {data: new Uint8Array(secret.length), degree: k + 1};}
    const coeffs = new Uint8Array(quorum);
    for (let i = 0; i < secret.length; i++) {
      crypto.getRandomValues(coeffs);
      coeffs[0] = secret[i];
      for (let n = 0; n < shares; n++) {
        shs[n].data[i] = gf256.evaluateAt(coeffs, n + 1);
      }
    }
    return shs;
  } : function (secret) {
    'use strict';
    const shs = [];
    for (let k = 0; k < shares; k++) {shs[k] = {data: new Uint8Array(secret.length), degree: k + 1};}
    const coeffs = new Uint8Array(quorum);
    if (random === undefined) {
      random = function(arr) {
        return require('crypto').randomBytes(arr.length);
      };
    }
    for (let i = 0; i < secret.length; i++) {
      random(coeffs);
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
    const length = shs[0].data.length;
    const secret = new Uint8Array(length);
    const yvalues = new Uint8Array(quorum);
    for (let i = 0; i < length; i++) {
      for (let i2 = 0; i2 < quorum; i2++) {yvalues[i2] = shs[i2].data[i];}
      secret[i] = matrix.multiply_vector(decoder, yvalues)[0];
    }
    return secret;
  };
}
