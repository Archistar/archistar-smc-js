/*
this is a simple implementation of Rabin IDS;
code is mostly taken from the Java version:
https://github.com/Archistar/archistar-smc/blob/master/src/main/java/at/archistar/crypto/secretsharing/RabinIDS.java
*/
import * as gf256 from "./gf256.js";
import * as matrix from "./matrix.js";
import asmod from "../dist/secret.js";

export function Configuration (shares, quorum) {
  // multiplication tables; created here, then copied onto the asm.js/emscripten heap
  // every time encode() runs, so that everything can be cleanly deallocated
  this.multable = new Uint8Array(shares * 256);
  for (let i = 0; i < shares; i++) {
    for (let j = 0; j < 256; j++) {
      this.multable[(i * 256) + j] = gf256.mult(i + 1, j);
    }
  }
  this.asm = asmod();
  this.encode = function (secret) {
    'use strict';
    const chunks = Math.ceil(secret.length / quorum);

    // copy the multiplication table onto the asm.js/emscripten heap
    let mult = this.asm._malloc(shares * 256);
    this.asm.HEAPU8.set(this.multable, mult);
    
    // copy the secret onto the asm.js/emscripten heap
    let input = this.asm._malloc(secret.length);
    this.asm.HEAPU8.set(secret, input);

    // two arrays of pointers to the secret-shared data
    // one on the asm.js/emscripten heap and one in JavaScript
    let output = this.asm._malloc(shares * 4);
    let pointers = new Array(shares);
    for (let i = 0; i < shares; i++) {
      let out = this.asm._malloc(chunks);
      this.asm.setValue(output + (i * 4), out, '*');
      pointers[i] = out;
    }

    this.asm._RabinEncode(input, secret.length, quorum, shares, output, mult);

    // construct the output objects, get the secret-shared data
    // out of the heap and free memory
    const shs = new Array(shares);
    for (let k = 0; k < shares; k++) {
      shs[k] = {
        data: this.asm.HEAPU8.slice(pointers[k], pointers[k] + chunks),
        degree: k + 1,
        original_length: secret.length
      };
      this.asm._free(pointers[k]);
    }

    this.asm._free(input);
    this.asm._free(output);
    this.asm._free(mult);

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
      for (let j = 0; j < quorum; j++) {
        const dec = decoder[j];
        var temp = gf256.mult(dec[0], shs[0].data[i]);
        for (let x = 1; x < quorum; x++) {
          temp = gf256.add(temp, gf256.mult(dec[x], shs[x].data[i]));
        }
        secret[(i * quorum) + j] = temp;
      }
    }
    return secret;
  };
}
