import * as gf256 from "./gf256.js";
import * as matrix from "./matrix.js";
import * as rand from "./random.js";

/**
 * @constructor
 * @param {number} shares - the number of shares to construct (aka 'n')
 * @param {number} quorum - the number of shares necessary for reconstruction (aka 'k')
 * @param {function} random - a function that returns a random byte-value; if undefined, our own randomByte will be used
 */
export function Configuration (shares, quorum, random) {
  if (random === undefined) {
    random = rand.randomByte;
  }
  this.encode = function (secret) {
    'use strict';
    const shs = new Array(shares);
    for (let k = 0; k < shares; k++) {shs[k] = {data: new Uint8Array(secret.length), degree: k + 1};}
    const coeffs = new Uint8Array(quorum);
    for (let i = 0; i < secret.length; i++) {
      coeffs[0] = secret[i];
      for (let i = 1; i < quorum; i++) {
        coeffs[i] = random();
      }
      for (let n = 0; n < shares; n++) {
        shs[n].data[i] = gf256.evaluateAt(coeffs, n + 1);
      }
    }
    return shs;
  };
  this.decode = function (shs) {
    'use strict';
    const xvalues = new Array(shs.length);
    for (let i = 0; i < shs.length; i++) {xvalues[i] = shs[i].degree;}
    const decoder = new Array(quorum);
    for (let i = 0, m = matrix.generate_decoder(quorum, xvalues); i < quorum; i++) {
      const dec = m[0][i];
      const tab = new Uint8Array(256);
      for (let j = 0; j < 256; j++) {
        tab[j] = gf256.mult(dec, j);
      }
      decoder[i] = tab;
    }
    const length = shs[0].data.length;
    const secret = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      let tmp = decoder[0][shs[0].data[i]];
      for (let j = 1; j < quorum; j++) {
        tmp = tmp ^ decoder[j][shs[j].data[i]];
      }
      secret[i] = tmp;
    }
    return secret;
  };
}
