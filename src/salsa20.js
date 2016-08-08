/*
an implementation of djb's Salsa20 according to spec:
http://cr.yp.to/snuffle/spec.pdf
*/

var salsa20 = salsa20 || {};

salsa20.modulus = 4294967296;

salsa20.add = function (a, b) {
  return (a + b) % salsa20.modulus;
};

salsa20.rotl = function (u, c) {
  var shifted = (u << c) % salsa20.modulus;
  var right = (u >>> (32 - c));
  return shifted ^ right;
};

salsa20.quarterround = function (y) {
  var z = new Uint32Array(4);
  z[1] = y[1] ^ (salsa20.rotl(salsa20.add(y[0], y[3]), 7));
  z[2] = y[2] ^ (salsa20.rotl(salsa20.add(z[1], y[0]), 9));
  z[3] = y[3] ^ (salsa20.rotl(salsa20.add(z[2], z[1]), 13));
  z[0] = y[0] ^ (salsa20.rotl(salsa20.add(z[3], z[2]), 18));
  return z;
};
