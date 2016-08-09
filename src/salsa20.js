/*
an implementation of djb's Salsa20 according to spec:
http://cr.yp.to/snuffle/spec.pdf
*/

var salsa20 = salsa20 || {};

salsa20.add = function (a, b) {
  return (a + b) % 4294967296; // 2^32
};

salsa20.rotl = function (u, c) {
  var shifted = (u << c) % 4294967296; // 2^32
  var right = (u >>> (32 - c));
  return shifted ^ right;
};

salsa20.quarterround = function (y) {
  var z = new Uint32Array(4);
  z[1] = y[1] ^ (salsa20.rotl(salsa20.add(y[0], y[3]),  7));
  z[2] = y[2] ^ (salsa20.rotl(salsa20.add(z[1], y[0]),  9));
  z[3] = y[3] ^ (salsa20.rotl(salsa20.add(z[2], z[1]), 13));
  z[0] = y[0] ^ (salsa20.rotl(salsa20.add(z[3], z[2]), 18));
  return z;
};

salsa20.rowround = function (y) {
  var z = new Uint32Array(16);
  var z1 = salsa20.quarterround([y[0], y[1], y[2], y[3]]);
  var z2 = salsa20.quarterround([y[5], y[6], y[7], y[4]]);
  var z3 = salsa20.quarterround([y[10],y[11],y[8], y[9]]);
  var z4 = salsa20.quarterround([y[15],y[12],y[13],y[14]]);
  z[0]  = z1[0]; z[1]  = z1[1]; z[2]  = z1[2]; z[3]  = z1[3];
  z[5]  = z2[0]; z[6]  = z2[1]; z[7]  = z2[2]; z[4]  = z2[3];
  z[10] = z3[0]; z[11] = z3[1]; z[8]  = z3[2]; z[9]  = z3[3];
  z[15] = z4[0]; z[12] = z4[1]; z[13] = z4[2]; z[14] = z4[3];
  return z;
};

salsa20.columnround = function (x) {
  var y = new Uint32Array(16);
  var y1 = salsa20.quarterround([x[0], x[4], x[8], x[12]]);
  var y2 = salsa20.quarterround([x[5], x[9], x[13],x[1]]);
  var y3 = salsa20.quarterround([x[10],x[14],x[2], x[6]]);
  var y4 = salsa20.quarterround([x[15],x[3], x[7], x[11]]);
  y[0]  = y1[0]; y[4]  = y1[1]; y[8]  = y1[2]; y[12] = y1[3];
  y[5]  = y2[0]; y[9]  = y2[1]; y[13] = y2[2]; y[1]  = y2[3];
  y[10] = y3[0]; y[14] = y3[1]; y[2]  = y3[2]; y[6]  = y3[3];
  y[15] = y4[0]; y[3]  = y4[1]; y[7]  = y4[2]; y[11] = y4[3];
  return y;
};

salsa20.doubleround = function (x) {
  return salsa20.rowround(salsa20.columnround(x));
};

salsa20.littleendian = function (b0, b1, b2, b3) {
  return b0 + (b1 * 256) + (b2 * 65536) + (b3 * 16777216);
};

salsa20.littleendian_rev = function (x) {
  var b = new Uint8Array(4);
  b[3] = x >>> 24;
  b[2] = (x ^ 4278190080) >>> 16; // bitmask: 2^32 - 2^24
  b[1] = (x ^ 4294901760) >>> 8; // bitmask: 2^32 - 2^16
  b[0] = x ^ 4294967040; // bitmask: 2^32 - 2^8
  return b;
};

salsa20.salsa20 = function (x) {
  var y = salsa20.doubleround(
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
  for (var i = 0; i < 16; i++) {
    y[i] = salsa20.add(x[i],y[i]);
  }
  return y;
};

salsa20.salsa20_k32 = function (k, n) {
  return salsa20.salsa20(new Uint32Array([
    1634760805, k[0], k[1], k[2],
    k[3], 857760878, n[0], n[1],
    n[2], n[3], 2036477234, k[4],
    k[5], k[6], k[7], 1797285236
  ]));
};

salsa20.code = function (key, nonce, text) {
  var res = new Uint8Array(text.length);
  var index = 0;
  for (var block = 0; block < text.length; block = block + 64) {
    var expanded = salsa20.salsa20_k32(key, [nonce[0], nonce[1], 0, block]);
    for (var i = 0; i < 16; i++) {
      var exp0 = salsa20.littleendian_rev(expanded[i]);
      res[index] = text[index] ^ exp0[0]; index++;
      res[index] = text[index] ^ exp0[1]; index++;
      res[index] = text[index] ^ exp0[2]; index++;
      res[index] = text[index] ^ exp0[3]; index++;
    }
  }
  return res;
};
