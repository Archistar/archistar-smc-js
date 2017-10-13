import * as table from './table.js';

/*
this is a straight translation of the java class:
https://github.com/Archistar/archistar-smc/blob/master/src/main/java/at/archistar/crypto/math/gf256/GF256.java

the lookup tables from the original are pregenerated into a separate file
*/

export function add (a, b) {
  'use strict';
  return a ^ b;
}

export function sub (a, b) {
  'use strict';
  return a ^ b;
}

export function mult (a, b) {
  'use strict';
  return (table.alogtable[(table.logtable[a]|0) + (table.logtable[b]|0)]|0);
}

export function pow (a, p) {
  'use strict';
  if (a === 0 && p !== 0) {
    return 0;
  } else {
    return table.alogtable[p*table.logtable[a] % 255];
  }
}

export function inverse (a) {
  'use strict';
  return table.alogtable[255 - (table.logtable[a] % 255)];
}

export function div (a, b) {
  'use strict';
  if (b === 0) {
    throw "Division by Zero";
  }
  return table.alogtable[table.logtable[a] + 255 - table.logtable[b]];
}

export function evaluateAt (coeffs, x) {
  'use strict';
  const degree = (coeffs.length - 1)|0;
  let result = (coeffs[degree])|0;

  for (let i = degree - 1; i >= 0; i--){
    result = (mult(result, x)|0) ^ (coeffs[i]|0);
  }
  return result;
}
