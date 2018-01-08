/*
an implementation of djb's Salsa20 according to spec:
http://cr.yp.to/snuffle/spec.pdf
*/

export function add (a, b) {
  'use strict';
  return (((a + b)|0) % 4294967296)|0; // 2^32
}

export function rotl (u, c) {
  'use strict';
  return ((((u << c)|0) % 4294967296)|0 | (u >>> (32 - c)|0)|0)|0;
}

export function quarterround (y, i0, i1, i2, i3) {
  'use strict';
  y[i1] = ((y[i1]|0) ^ (rotl(add(y[i0]|0, y[i3]|0),  7)))|0;
  y[i2] = ((y[i2]|0) ^ (rotl(add(y[i1]|0, y[i0]|0),  9)))|0;
  y[i3] = ((y[i3]|0) ^ (rotl(add(y[i2]|0, y[i1]|0), 13)))|0;
  y[i0] = ((y[i0]|0) ^ (rotl(add(y[i3]|0, y[i2]|0), 18)))|0;
}

export function rowround (y) {
  'use strict';
  quarterround(y,  0,  1,  2,  3);
  quarterround(y,  5,  6,  7,  4);
  quarterround(y, 10, 11,  8,  9);
  quarterround(y, 15, 12, 13, 14);
}

export function columnround (x) {
  'use strict';
  quarterround(x,  0,  4,  8, 12);
  quarterround(x,  5,  9, 13,  1);
  quarterround(x, 10, 14,  2,  6);
  quarterround(x, 15,  3,  7, 11);
}

export function doubleround (x) {
  'use strict';
  columnround(x);
  rowround(x);
}

export function littleendian (b0, b1, b2, b3) {
  'use strict';
  return b0 + (b1 * 256) + (b2 * 65536) + (b3 * 16777216);
}

export function littleendian_rev (x) {
  'use strict';
  const b = new Uint8Array(4);
  b[3] = x >>> 24; // we would need to & with bitmasks here
  b[2] = x >>> 16; // but values are auto-truncated to 8 bits
  b[1] = x >>> 8;  // because of the Uint8Array
  b[0] = x;
  return b;
}

/*
x and y are buffers with the same content initially
when done, y is unchanged; x contains the result
*/
export function salsa20 (x, y) {
  'use strict';
  doubleround(x);
  doubleround(x);
  doubleround(x);
  doubleround(x);
  doubleround(x);
  doubleround(x);
  doubleround(x);
  doubleround(x);
  doubleround(x);
  doubleround(x);
  for (let i = 0; i < 16; i++) {
    x[i] = add(x[i],y[i]);
  }
}

export function salsa20_k32 (k, n) {
  'use strict';
  const a = new Uint32Array([
    1634760805, k[0], k[1], k[2],
    k[3], 857760878, n[0], n[1],
    n[2], n[3], 2036477234, k[4],
    k[5], k[6], k[7], 1797285236
  ]);
  const b = Uint32Array.from(a);
  salsa20(a, b);
  return a;
}

/*
use this to encrypt and decrypt with Salsa20
keys is Uint8Array of length 32 (that means: we only use Salsa20 with 32 byte keys)
nonce is Uint8Array of length 8
text can be of arbitrary length (will be auto-truncated)
*/
export function code (key, nonce, text) {
  'use strict';
  const buffer_1 = new ArrayBuffer(64);
  const buffer_2 = new ArrayBuffer(64);
  const res = new Uint8Array(Math.ceil(text.length / 64) * 64);
  const res_u32 = new Uint32Array(res.buffer);
  res.set(text);
  const buffer2_view = new DataView(buffer_2);
  const key_view = new DataView(key.buffer);
  const nonce_view = new DataView(nonce.buffer);
  const buffer1 = new Uint32Array(buffer_1);
  const buffer2 = new Uint32Array(buffer_2);

  buffer2_view.setUint32(0, 1634760805, true);
  buffer2_view.setUint32(4, key_view.getUint32(0, true), true);
  buffer2_view.setUint32(8, key_view.getUint32(4, true), true);
  buffer2_view.setUint32(12, key_view.getUint32(8, true), true);
  buffer2_view.setUint32(16, key_view.getUint32(12, true), true);
  buffer2_view.setUint32(20, 857760878, true);
  buffer2_view.setUint32(24, nonce_view.getUint32(0, true), true);
  buffer2_view.setUint32(28, nonce_view.getUint32(4, true), true);
  buffer2_view.setUint32(32, 0, true);
  buffer2_view.setUint32(36, 0, true);
  buffer2_view.setUint32(40, 2036477234, true);
  buffer2_view.setUint32(44, key_view.getUint32(16, true), true);
  buffer2_view.setUint32(48, key_view.getUint32(20, true), true);
  buffer2_view.setUint32(52, key_view.getUint32(24, true), true);
  buffer2_view.setUint32(56, key_view.getUint32(28, true), true);
  buffer2_view.setUint32(60, 1797285236, true);

  const blocks = Math.ceil(text.length / 64);
  for (let block = 0; block < blocks; block++) {
    buffer2_view.setUint32(36, block, true);
    buffer1.set(buffer2);
    for (let i = 0; i < 10; i++) {
      //columnround
      quarterround(buffer2, 0,  4,  8, 12);
      quarterround(buffer2, 5,  9, 13,  1);
      quarterround(buffer2, 10, 14,  2,  6);
      quarterround(buffer2, 15,  3,  7, 11);
      //rowround
      quarterround(buffer2, 0,  1,  2,  3);
      quarterround(buffer2, 5,  6,  7,  4);
      quarterround(buffer2, 10, 11,  8,  9);
      quarterround(buffer2, 15, 12, 13, 14);
    }
    for (let i = 0; i < 16; i++) {
      buffer1[i] += buffer2[i];
      res_u32[block * 16 + i] ^= buffer1[i];
    }
  }
  return res.slice(0, text.length);
}
