/*
an implementation of djb's Salsa20 according to spec:
http://cr.yp.to/snuffle/spec.pdf
*/

var salsa20 = module.exports;

salsa20.add = function (a, b) {
  'use strict';
  return (a + b) % 4294967296; // 2^32
};

salsa20.rotl = function (u, c) {
  'use strict';
  var shifted = (u << c) % 4294967296; // 2^32
  var right = (u >>> (32 - c));
  return shifted ^ right;
};

salsa20.quarterround = function (y) {
  'use strict';
  const z = new Uint32Array(4);
  z[1] = y[1] ^ (salsa20.rotl(salsa20.add(y[0], y[3]),  7));
  z[2] = y[2] ^ (salsa20.rotl(salsa20.add(z[1], y[0]),  9));
  z[3] = y[3] ^ (salsa20.rotl(salsa20.add(z[2], z[1]), 13));
  z[0] = y[0] ^ (salsa20.rotl(salsa20.add(z[3], z[2]), 18));
  return z;
};

salsa20.rowround = function (y) {
  'use strict';
  const z = new Uint32Array(16);
  const z1 = salsa20.quarterround([y[0], y[1], y[2], y[3]]);
  const z2 = salsa20.quarterround([y[5], y[6], y[7], y[4]]);
  const z3 = salsa20.quarterround([y[10],y[11],y[8], y[9]]);
  const z4 = salsa20.quarterround([y[15],y[12],y[13],y[14]]);
  z[0]  = z1[0]; z[1]  = z1[1]; z[2]  = z1[2]; z[3]  = z1[3];
  z[5]  = z2[0]; z[6]  = z2[1]; z[7]  = z2[2]; z[4]  = z2[3];
  z[10] = z3[0]; z[11] = z3[1]; z[8]  = z3[2]; z[9]  = z3[3];
  z[15] = z4[0]; z[12] = z4[1]; z[13] = z4[2]; z[14] = z4[3];
  return z;
};

salsa20.columnround = function (x) {
  'use strict';
  const y = new Uint32Array(16);
  const y1 = salsa20.quarterround([x[0], x[4], x[8], x[12]]);
  const y2 = salsa20.quarterround([x[5], x[9], x[13],x[1]]);
  const y3 = salsa20.quarterround([x[10],x[14],x[2], x[6]]);
  const y4 = salsa20.quarterround([x[15],x[3], x[7], x[11]]);
  y[0]  = y1[0]; y[4]  = y1[1]; y[8]  = y1[2]; y[12] = y1[3];
  y[5]  = y2[0]; y[9]  = y2[1]; y[13] = y2[2]; y[1]  = y2[3];
  y[10] = y3[0]; y[14] = y3[1]; y[2]  = y3[2]; y[6]  = y3[3];
  y[15] = y4[0]; y[3]  = y4[1]; y[7]  = y4[2]; y[11] = y4[3];
  return y;
};

salsa20.doubleround = function (x) {
  'use strict';
  return salsa20.rowround(salsa20.columnround(x));
};

salsa20.littleendian = function (b0, b1, b2, b3) {
  'use strict';
  return b0 + (b1 * 256) + (b2 * 65536) + (b3 * 16777216);
};

salsa20.littleendian_rev = function (x) {
  'use strict';
  const b = new Uint8Array(4);
  b[3] = x >>> 24;
  b[2] = (x ^ 4278190080) >>> 16; // bitmask: 2^32 - 2^24
  b[1] = (x ^ 4294901760) >>> 8; // bitmask: 2^32 - 2^16
  b[0] = x ^ 4294967040; // bitmask: 2^32 - 2^8
  return b;
};

salsa20.salsa20 = function (x) {
  'use strict';
  const y = salsa20.doubleround(
            salsa20.doubleround(
            salsa20.doubleround(
            salsa20.doubleround(
            salsa20.doubleround(
            salsa20.doubleround(
            salsa20.doubleround(
            salsa20.doubleround(
            salsa20.doubleround(
            salsa20.doubleround(
            (x)))))))))));
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
