import * as gf256 from "./gf256.js";
import * as matrix from "./matrix.js";
import * as heap from "./heap.js";

/**
 * @constructor
 * @param {number} shares - the number of shares to construct (aka 'n')
 * @param {number} quorum - the number of shares necessary for reconstruction (aka 'k')
 */
export function Configuration (shares, quorum) {
  // multiplication tables for encoding
  const multable = new Uint8Array(shares * 256);
  for (let i = 0; i < shares; i++) {
    for (let j = 0; j < 256; j++) {
      multable[(i * 256) + j] = gf256.mult(i + 1, j);
    }
  }
  function encode(secret) {
    'use strict';

    // length of each share; length of multiplication table segment; base offset of secret-share data
    const new_len = Math.ceil(secret.length / quorum);
    const mult_len = 256 * shares;
    const out_base = secret.length + mult_len;

    // "allocate" asm.js heap and views to memory segments
    const asm_heap = heap.allocate(secret.length + mult_len + (new_len * shares));
    const input = new Uint8Array(asm_heap, 0, secret.length);
    const mult = new Uint8Array(asm_heap, secret.length, 256 * shares);

    // copy input and multiplication table onto heap
    input.set(secret);
    mult.set(multable);

    const asm0 = asm({ Math: Math, Int8Array: Int8Array, Uint8Array: Uint8Array }, {}, asm_heap);
    asm0._RabinEncode(0, secret.length, quorum, shares);

    // construct the output objects with secret-shared data copied out of the heap
    const res = new Array(shares);
    for (let x = 0; x < shares; x++) {
      let out = new Uint8Array(asm_heap, out_base + (new_len * x), new_len);
      res[x] = {
        data: out.slice(),
        degree: x + 1,
        original_length: secret.length
      };
    }

    return res;
  }
  function decode(shs) {
    'use strict';
    const xvalues = new Uint8Array(shs.length);
    for (let i = 0; i < shs.length; i++) {xvalues[i] = shs[i].degree;}
    const decoder = matrix.generate_decoder(quorum, xvalues);
    const original_length = shs[0].original_length;

    // length of shares; base offset of multiplication table segment; length of multiplication table segment; base offset of output data
    const length = shs[0].data.length;
    const mult_base = length * quorum;
    const mult_len = 256 * quorum * quorum;
    const out_base = mult_base + mult_len;

    // "allocate" asm.js heap and views to memory segments
    const asm_heap = heap.allocate(out_base + original_length);
    const input = new Uint8Array(asm_heap, 0, mult_base);
    const mult = new Uint8Array(asm_heap, mult_base, mult_len);
    const output = new Uint8Array(asm_heap, out_base, original_length);

    // copy the input data onto the heap
    for (let x = 0; x < quorum; x++) {
      input.set(shs[x].data, length * x);
    }

    // construct the multiplication tables and copy them onto the heap
    decoder.forEach((c, i, _) => c.forEach((m, j, _) => {
      let buf = new Uint8Array(asm_heap, mult_base + (i * quorum * 256) + (j * 256), 256);
      for (let x = 0; x < 256; x++) {
        buf[x] = gf256.mult(x, m);
      }
    }));

    const asm0 = asm({ Math: Math, Int8Array: Int8Array, Uint8Array: Uint8Array }, {}, asm_heap);
    asm0._RabinDecode(0, length, original_length, quorum);

    return output.slice();
  }
  this.encode = encode;
  this.decode = decode;
}
// artifact compiled from "secret.c"
function asm (global, env, buffer) {
  'use asm';
  var a = new global.Int8Array(buffer);
  var d = new global.Uint8Array(buffer);
  var N = global.Math.imul;
  function _RabinEncode(b, c, d, e) {
    b = b | 0;
    c = c | 0;
    d = d | 0;
    e = e | 0;
    var f = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, u = 0, v = 0;
    if (!e) return;
    t = b + c | 0;
    u = t + (e << 8) | 0;
    v = (c >>> 0) % (d >>> 0) | 0;
    n = (c >>> 0) / (d >>> 0) | 0;
    o = n + ((v | 0) != 0 & 1) | 0;
    k = d + -1 | 0;
    l = d >>> 0 > 1;
    p = (v | 0) == 0;
    q = c + -1 | 0;
    r = b + q | 0;
    s = v >>> 0 > 1;
    if (k >>> 0 < c >>> 0) j = 0; else {
    i = 0;
    do {
      h = t + (i << 8) | 0;
      j = u + (N(o, i) | 0) | 0;
      if (!p) {
      f = a[r >> 0] | 0;
      if (s) {
        g = 1;
        do {
        f = a[h + (f & 255) >> 0] ^ a[b + (q - g) >> 0];
        g = g + 1 | 0;
        } while ((g | 0) != (v | 0));
      }
      a[j + n >> 0] = f;
      }
      i = i + 1 | 0;
    } while ((i | 0) != (e | 0));
    return;
    }
    do {
    i = t + (j << 8) | 0;
    m = u + (N(o, j) | 0) | 0;
    if (l) {
      h = k;
      do {
      f = 1;
      g = a[b + h >> 0] | 0;
      do {
        g = a[i + (g & 255) >> 0] ^ a[b + (h - f) >> 0];
        f = f + 1 | 0;
      } while ((f | 0) != (d | 0));
      a[m + ((h >>> 0) / (d >>> 0) | 0) >> 0] = g;
      h = h + d | 0;
      } while (h >>> 0 < c >>> 0);
    } else {
      f = k;
      do {
      a[m + ((f >>> 0) / (d >>> 0) | 0) >> 0] = a[b + f >> 0] | 0;
      f = f + d | 0;
      } while (f >>> 0 < c >>> 0);
    }
    if (!p) {
      f = a[r >> 0] | 0;
      if (s) {
      g = 1;
      do {
        f = a[i + (f & 255) >> 0] ^ a[b + (q - g) >> 0];
        g = g + 1 | 0;
      } while ((g | 0) != (v | 0));
      }
      a[m + n >> 0] = f;
    }
    j = j + 1 | 0;
    } while ((j | 0) != (e | 0));
    return;
  }
  function _RabinDecode(b, c, e, f) {
    b = b | 0;
    c = c | 0;
    e = e | 0;
    f = f | 0;
    var g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0;
    n = b + (N(f, c) | 0) | 0;
    o = f << 8;
    p = n + (N(o, f) | 0) | 0;
    if (!c) return;
    k = f >>> 0 > 1;
    if (!f) return; else j = 0;
    do {
    l = b + j | 0;
    m = N(j, f) | 0;
    if (k) {
      g = 0;
      do {
      i = n + (N(g, o) | 0) | 0;
      e = a[i + (d[l >> 0] | 0) >> 0] | 0;
      h = 1;
      do {
        e = a[i + (h << 8) + (d[b + (N(h, c) | 0) + j >> 0] | 0) >> 0] ^ e;
        h = h + 1 | 0;
      } while ((h | 0) != (f | 0));
      a[p + (g + m) >> 0] = e;
      g = g + 1 | 0;
      } while ((g | 0) != (f | 0));
    } else {
      e = 0;
      do {
      i = n + (N(e, o) | 0) | 0;
      a[p + (e + m) >> 0] = a[i + (d[l >> 0] | 0) >> 0] | 0;
      e = e + 1 | 0;
      } while ((e | 0) != (f | 0));
    }
    j = j + 1 | 0;
    } while ((j | 0) != (c | 0));
    return;
  }
  return {
    _RabinEncode: _RabinEncode,
    _RabinDecode: _RabinDecode
  };
}
