/*
this is a straight translation of the java class:
https://github.com/Archistar/archistar-smc/blob/master/src/main/java/at/archistar/crypto/math/gf256/GF256.java

the lookup tables from the original are pregenerated into a separate file
*/

const gf256 = module.exports;

const table = require('./table.js');

gf256.add = function (a, b) {
  'use strict';
  return a ^ b;
};

gf256.sub = function (a, b) {
  'use strict';
  return a ^ b;
};

gf256.mult = function (a, b) {
  'use strict';
  return (table.alogtable[(table.logtable[a]|0) + (table.logtable[b]|0)]|0);
};

gf256.pow = function (a, p) {
  'use strict';
  if (a === 0 && p !== 0) {
    return 0;
  } else {
    return table.alogtable[p*table.logtable[a] % 255];
  }
};

gf256.inverse = function (a) {
  'use strict';
  return table.alogtable[255 - (table.logtable[a] % 255)];
};

gf256.div = function (a, b) {
  'use strict';
  if (b === 0) {
    throw "Division by Zero";
  }
  return table.alogtable[table.logtable[a] + 255 - table.logtable[b]];
};

gf256.evaluateAt = function (coeffs, x) {
  'use strict';
  const degree = (coeffs.length - 1)|0;
  let result = (coeffs[degree])|0;

  for (let i = degree - 1; i >= 0; i--){
    result = (gf256.mult(result, x)|0) ^ (coeffs[i]|0);
  }
  return result;
};
