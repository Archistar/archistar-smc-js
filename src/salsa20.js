/*
an implementation of djb's Salsa20 according to spec:
http://cr.yp.to/snuffle/spec.pdf
*/

const salsa20 = module.exports;

salsa20.add = function (a, b) {
  'use strict';
  return (a + b) % 4294967296; // 2^32
};

salsa20.rotl = function (u, c) {
  'use strict';
  const shifted = (u << c) % 4294967296; // 2^32
  const right = (u >>> (32 - c));
  return shifted ^ right;
};

salsa20.quarterround = function (y, i0, i1, i2, i3) {
  'use strict';
  y[i1] = y[i1] ^ (salsa20.rotl(salsa20.add(y[i0], y[i3]),  7));
  y[i2] = y[i2] ^ (salsa20.rotl(salsa20.add(y[i1], y[i0]),  9));
  y[i3] = y[i3] ^ (salsa20.rotl(salsa20.add(y[i2], y[i1]), 13));
  y[i0] = y[i0] ^ (salsa20.rotl(salsa20.add(y[i3], y[i2]), 18));
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

salsa20.salsa20 = function (x) {
  'use strict';
  const y = Uint32Array.from(x);
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
    y[i] = salsa20.add(x[i],y[i]);
  }
  return y;
};

salsa20.salsa20_k32 = function (k, n) {
  'use strict';
  return salsa20.salsa20(new Uint32Array([
    1634760805, k[0], k[1], k[2],
    k[3], 857760878, n[0], n[1],
    n[2], n[3], 2036477234, k[4],
    k[5], k[6], k[7], 1797285236
  ]));
};

/*
use this to encrypt and decrypt with Salsa20
keys is Uint8Array of length 32 (that means: we only use Salsa20 with 32 byte keys)
nonce is Uint8Array of length 8
text is Uint8Array of length l % 64 == 0
*/
salsa20.code = function (key, nonce, text) {
  'use strict';
  const res = new Uint8Array(text.length);
  let index = 0;
  const length = text.length;
  const key32 = new Uint32Array(8);
  const nonce32 = new Uint32Array(2);
  for (let i0 = 0; i0 < 8; i0++) {
      key32[i0] = salsa20.littleendian(key[i0*4], key[i0*4+1], key[i0*4+2], key[i0*4+3]);
    }
  nonce32[0] = salsa20.littleendian(nonce[0], nonce[1], nonce[2], nonce[3]);
  nonce32[1] = salsa20.littleendian(nonce[4], nonce[5], nonce[6], nonce[7]);
  for (let block = 0; block < length; block = block + 64) {
    const expanded = salsa20.salsa20_k32(key32, [nonce32[0], nonce32[1], 0, block]);
    for (let i = 0; i < 16; i++) {
      const exp0 = salsa20.littleendian_rev(expanded[i]);
      res[index] = text[index] ^ exp0[0]; index++;
      res[index] = text[index] ^ exp0[1]; index++;
      res[index] = text[index] ^ exp0[2]; index++;
      res[index] = text[index] ^ exp0[3]; index++;
    }
  }
  return res;
};
