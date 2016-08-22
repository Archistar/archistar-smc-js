/*
an implementation of djb's Salsa20 according to spec:
http://cr.yp.to/snuffle/spec.pdf
*/

const salsa20 = module.exports;

salsa20.add = function (a, b) {
  'use strict';
  return (((a + b)|0) % 4294967296)|0; // 2^32
};

salsa20.rotl = function (u, c) {
  'use strict';
  return ((((u << c)|0) % 4294967296)|0 ^ (u >>> (32 - c)|0)|0)|0;
};

salsa20.quarterround = function (y, i0, i1, i2, i3) {
  'use strict';
  y[i1] = ((y[i1]|0) ^ (salsa20.rotl(salsa20.add(y[i0]|0, y[i3]|0),  7)))|0;
  y[i2] = ((y[i2]|0) ^ (salsa20.rotl(salsa20.add(y[i1]|0, y[i0]|0),  9)))|0;
  y[i3] = ((y[i3]|0) ^ (salsa20.rotl(salsa20.add(y[i2]|0, y[i1]|0), 13)))|0;
  y[i0] = ((y[i0]|0) ^ (salsa20.rotl(salsa20.add(y[i3]|0, y[i2]|0), 18)))|0;
};

salsa20.quarterround_ugly = function (y, i0, i1, i2, i3) {
  'use strict';
  const u0 = (((y[i0]|0) + (y[i3]|0)) % 4294967296)|0;
  const u1 = (((y[i1]|0) + (y[i0]|0)) % 4294967296)|0;
  const u2 = (((y[i2]|0) + (y[i1]|0)) % 4294967296)|0;
  const u3 = (((y[i3]|0) + (y[i2]|0)) % 4294967296)|0;
  y[i1] = ((y[i1]|0) ^ ((((u0 <<  7)|0) % 4294967296)|0 ^ (u0 >>> 25)|0))|0;
  y[i2] = ((y[i2]|0) ^ ((((u1 <<  9)|0) % 4294967296)|0 ^ (u1 >>> 23)|0))|0;
  y[i3] = ((y[i3]|0) ^ ((((u2 << 13)|0) % 4294967296)|0 ^ (u2 >>> 19)|0))|0;
  y[i0] = ((y[i0]|0) ^ ((((u3 << 18)|0) % 4294967296)|0 ^ (u3 >>> 14)|0))|0;
};

salsa20.rowround = function (y) {
  'use strict';
  salsa20.quarterround(y,  0,  1,  2,  3);
  salsa20.quarterround(y,  5,  6,  7,  4);
  salsa20.quarterround(y, 10, 11,  8,  9);
  salsa20.quarterround(y, 15, 12, 13, 14);
};

salsa20.columnround = function (x) {
  'use strict';
  salsa20.quarterround(x,  0,  4,  8, 12);
  salsa20.quarterround(x,  5,  9, 13,  1);
  salsa20.quarterround(x, 10, 14,  2,  6);
  salsa20.quarterround(x, 15,  3,  7, 11);
};

salsa20.doubleround = function (x) {
  'use strict';
  salsa20.columnround(x);
  salsa20.rowround(x);
};

salsa20.littleendian = function (b0, b1, b2, b3) {
  'use strict';
  return b0 + (b1 * 256) + (b2 * 65536) + (b3 * 16777216);
};

salsa20.littleendian_rev = function (x) {
  'use strict';
  const b = new Uint8Array(4);
  b[3] = x >>> 24; // we would need to & with bitmasks here
  b[2] = x >>> 16; // but values are auto-truncated to 8 bits
  b[1] = x >>> 8;  // because of the Uint8Array
  b[0] = x;
  return b;
};

/*
x and y are buffers with the same content initially
when done, y is unchanged; x contains the result
*/
salsa20.salsa20 = function (x, y) {
  'use strict';
  salsa20.doubleround(x);
  salsa20.doubleround(x);
  salsa20.doubleround(x);
  salsa20.doubleround(x);
  salsa20.doubleround(x);
  salsa20.doubleround(x);
  salsa20.doubleround(x);
  salsa20.doubleround(x);
  salsa20.doubleround(x);
  salsa20.doubleround(x);
  for (let i = 0; i < 16; i++) {
    x[i] = salsa20.add(x[i],y[i]);
  }
};

salsa20.salsa20_k32 = function (k, n) {
  'use strict';
  const a = new Uint32Array([
    1634760805, k[0], k[1], k[2],
    k[3], 857760878, n[0], n[1],
    n[2], n[3], 2036477234, k[4],
    k[5], k[6], k[7], 1797285236
  ]);
  const b = Uint32Array.from(a);
  salsa20.salsa20(a, b);
  return a;
};

/*
a special in-place version:
in salsa20() we do 10 doublerounds and then add() the original -
idea: create the original once and just change the block number
(because key and nonce remain the same throughout )
so we assume that buffer1 and buffer2 are Uint32Arrays of length 16
and that buffer2 is set up like in salsa20_k32()
when done, buffer2 is unchanged; buffer1 contains the result
*/
salsa20.salsa20_expand_inplace = function (buffer1, buffer2, block_number) {
  'use strict';
  buffer2[9] = block_number;
  buffer1.set(buffer2);
  salsa20.salsa20(buffer1, buffer2);
};

/*
use this to encrypt and decrypt with Salsa20
keys is Uint8Array of length 32 (that means: we only use Salsa20 with 32 byte keys)
nonce is Uint8Array of length 8
text can be of arbitrary length (will be auto-truncated)
*/
salsa20.code = function (key, nonce, text) {
  'use strict';
  const text_view = new DataView(text.buffer);
  const res = new Uint8Array(text.length);
  const res_view = new DataView(res.buffer);
  let index = 0;
  const length = text.length;
  const key32 = new Uint32Array(8);
  const nonce32 = new Uint32Array(2);
  for (let i0 = 0; i0 < 8; i0++) {
      key32[i0] = salsa20.littleendian(key[i0*4], key[i0*4+1], key[i0*4+2], key[i0*4+3]);
    }
  nonce32[0] = salsa20.littleendian(nonce[0], nonce[1], nonce[2], nonce[3]);
  nonce32[1] = salsa20.littleendian(nonce[4], nonce[5], nonce[6], nonce[7]);

  // the buffers we will re-use throughout the coding
  const buffer1 = new Uint32Array(16);
  // in buffer2, only the block number will change
  const buffer2 = new Uint32Array([
    1634760805, key32[0],  key32[1],   key32[2],
    key32[3],   857760878, nonce32[0], nonce32[1],
    0,          0,         2036477234, key32[4],
    key32[5],   key32[6],  key32[7],   1797285236
  ]);

  for (let block = 0; block < length; block = block + 64) {
    buffer2[9] = block;
    buffer1.set(buffer2);
    for (let i = 0; i < 10; i++) {
      //columnround
      salsa20.quarterround_ugly(buffer1,  0,  4,  8, 12);
      salsa20.quarterround_ugly(buffer1,  5,  9, 13,  1);
      salsa20.quarterround_ugly(buffer1, 10, 14,  2,  6);
      salsa20.quarterround_ugly(buffer1, 15,  3,  7, 11);
      //rowround
      salsa20.quarterround_ugly(buffer1,  0,  1,  2,  3);
      salsa20.quarterround_ugly(buffer1,  5,  6,  7,  4);
      salsa20.quarterround_ugly(buffer1, 10, 11,  8,  9);
      salsa20.quarterround_ugly(buffer1, 15, 12, 13, 14);
    }
    for (let i = 0; i < 16; i++) {
      buffer1[i] = salsa20.add(buffer1[i]|0, buffer2[i]|0)|0;
    }
    for (let i = 0; i < 16; i++) {
      if (index + 4 < length) {
        // thanks to JavaScript's TypedArrays, we can just do this
        res_view.setUint32(index, buffer1[i] ^ text_view.getUint32(index));
        index = index + 4;
      } else {
        // and have to do this only at the very end
        const exp0 = salsa20.littleendian_rev(buffer1[i]);
        while (index < length) {
          res[index] = text[index] ^ exp0[index]; index++;
        }
      }
    }
  }
  return res;
};
