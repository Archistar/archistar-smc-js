import * as gf256 from './gf256.js';
/*
utility functions for GF256-matrices
*/

/*
 Gauß-Jordan algorithm to invert a matrix
 assumes that m is a quadratic and reversible matrix
 the input parameter is not mutated; code taken from:
 https://github.com/Archistar/archistar-smc/blob/master/src/main/java/at/archistar/crypto/math/GenericMatrix.java
*/
export function inverse (m) {
  'use strict';
  let size = m.length;
  const res = generate_identity(size);
  const tmp = deep_copy(m);

  for (let i = 0; i < size; i++) {

    if (tmp[i][i] === 0 && !find_and_swap_nonzero_in_row(i, size, tmp, res)) {
      size = size - 1;
    }

    normalize_row(tmp[i], res[i], gf256.inverse(tmp[i][i]));

    for (let j = 0; j < size; j++) {
      if (j === i) {continue;}
      const coeff = tmp[j][i];
      if (coeff === 0) {continue;}
      mult_and_subtract(tmp[j], tmp[i], coeff);
      mult_and_subtract(res[j], res[i], coeff);
    }
  }

  // we could assert here that tmp is now an identity matrix

  return res;
}

function mult_and_subtract (row, normalized, coeff) {
  'use strict';
  const length = row.length;
  for (let i = 0; i < length; i++) {
    row[i] = gf256.sub(row[i], gf256.mult(normalized[i], coeff));
  }
}

function normalize_row (tmp_row, res_row, element) {
  'use strict';
  const length = tmp_row.length;
  for (let i = 0; i < length; i++) {
    tmp_row[i] = gf256.mult(tmp_row[i], element);
    res_row[i] = gf256.mult(res_row[i], element);
  }
}

function find_and_swap_nonzero_in_row (i, num_rows, tmp, res) {
  'use strict';
  for (let j = i + 1; j < num_rows; j++) {
    if (tmp[j][i] !== 0) {
      swap_rows(tmp, i, j);
      swap_rows(res, i, j);
      return true;
    }
  }
  return false;
}

function swap_rows (matrix, first, second) {
  'use strict';
  const tmp = matrix[first];
  matrix[first] = matrix[second];
  matrix[second] = tmp;
}

export function generate_identity (size) {
  'use strict';
  const res = new Array(size);
  for (let i = 0; i < size; i++) {
    res[i] = new Uint8Array(size);
    for (let j = 0; j < size; j++) {
      if (i === j) {
        res[i][j] = 1;
      } else {
        res[i][j] = 0;
      }
    }
  }
  return res;
}

function deep_copy (m) {
  'use strict';
  const res = new Array(m.length);
  const rows = m.length;
  for (let i = 0; i < rows; i++) {
    const columns = m[i].length;
    res[i] = new Uint8Array(columns);
    for (let j = 0; j < columns; j++) {
      res[i][j] = m[i][j];
    }
  }
  return res;
}

export function is_identity (m) {
  'use strict';
  const size = m.length;
  for (let i = 0; i < size; i++) {
    if (m[i].length !== size) {return false;}
    for (let j = 0; j < size; j++) {
      if (i === j && m[i][j] !== 1) {return false;}
      if (i !== j && m[i][j] !== 0) {return false;}
    }
  }
  return true;
}

export function multiply (a, b) {
  'use strict';
  const a_rows = a.length;
  const a_columns = a[0].length;
  const b_columns = b[0].length;
  const res = new Array(a_rows);
  for (let i0 = 0; i0 < a_rows; i0++) {
    res [i0] = new Uint8Array(b_columns);
    for (let k0 = 0; k0 < b_columns; k0++) {
      res[i0][k0] = 0;
    }
  }

  for (let j = 0; j < a_columns; j++) {
    for (let i = 0; i < a_rows; i++) {
      for (let k = 0; k < b_columns; k++) {
        res[i][k] = gf256.add(res[i][k], gf256.mult(a[i][j], b[j][k]));
      }
    }
  }

  return res;
}

export function multiply_vector (m, v) {
  'use strict';
  const length = v.length;
  const res = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    let tmp = 0;
    for (let j = 0; j < length; j++) {
      tmp = gf256.add(tmp, gf256.mult(m[i][j], v[j]));
    }
    res[i] = tmp;
  }
  return res;
}

export function generate_decoder (size, values) {
  'use strict';
  const res = new Array(size);
  for (let i = 0; i < size; i++) {
    res[i] = new Uint8Array(size);
    for (let j = 0; j < size; j++) {
      res[i][j] = gf256.pow(values[i], j);
    }
  }
  return inverse(res);
}
