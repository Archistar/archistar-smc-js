/*
implements Shamir Perfect Secret Sharing
*/

var shamir_pss = module.exports;

const gf256 = require('./gf256.js');
const matrix = require('./matrix.js');

// random is a source that implements the functionality of window.crypto.getRandomValues()
// if it is undefined, window.crypto.getRandomValues() will be used
shamir_pss.Configuration = function (shares, quorum, random) {
  this.shares = shares;
  this.quorum = quorum;
  this.random = random;
  this.encode = function (secret) {
    'use strict';
    const shs = [];
    for (let k = 0; k < this.shares; k++) {shs[k] = {data: [], degree: k + 1};}
    for (let i = 0; i < secret.length; i++) {
      let coeffs = new Uint8Array(quorum);
      if (this.random === undefined) {
        const randomBytes = require('randombytes');
        coeffs = randomBytes(quorum);
      } else {
        this.random(coeffs);
      }
      coeffs[0] = secret[i];
      for (let n = 0; n < this.shares; n++) {
        shs[n].data[i] = gf256.evaluateAt(coeffs, n + 1);
      }
    }
    return shs;
  };
  this.decode = function (shs) {
    'use strict';
    const xvalues = [];
    for (let i0 = 0; i0 < shs.length; i0++) {xvalues[i0] = shs[i0].degree;}
    const decoder = matrix.generate_decoder(this.quorum, xvalues);
    const secret = [];
    const length = shs[0].data.length;
    for (let i = 0; i < length; i++) {
      const yvalues = [];
      for (let i2 = 0; i2 < this.quorum; i2++) {yvalues[i2] = shs[i2].data[i];}
      const decoded = matrix.multiply_vector(decoder, yvalues);
      secret.push(decoded[0]);
    }
    return secret;
  };
};
