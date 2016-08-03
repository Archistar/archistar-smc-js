/*
this is a straight translation of the java class:
https://github.com/Archistar/archistar-smc/blob/master/src/main/java/at/archistar/crypto/math/gf256/GF256.java

the lookup tables from the original are pregenerated into a separate file
*/

var gf256 = gf256 || {};

gf256.add = function (a, b) {
  'use strict';
  return a ^ b;
};

gf256.sub = function (a, b) {
  'use strict';
  return a ^ b;
};

gf256.mult = function (a, b) {
 return gf256.alogtable[gf256.logtable[a] + gf256.logtable[b]];
};

gf256.pow = function (a, p) {
  'use strict';
  if (a === 0 && p !== 0) {
    return 0;
  } else {
    return gf256.alogtable[p*gf256.logtable[a] % 255];
  }
};

gf256.inverse = function (a) {
  'use strict';
  return gf256.alogtable[255 - (gf256.logtable[a] % 255)];
};

gf256.div = function (a, b) {
  'use strict';
  if (b === 0) {
    throw "Division by Zero";
  }
  return gf256.alogtable[gf256.logtable[a] + 255 - gf256.logtable[b]];
};

gf256.evaluateAt = function (coeffs, x) {
  'use strict';
  let degree = coeffs.length - 1;
  let result = coeffs[degree];

  for (let i = degree - 1; i >= 0; i--){
    result = add(mult(result, x), coeffs[i]);
  }
  return result;
};
