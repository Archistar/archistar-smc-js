/*
utility functions for GF256-matrices
*/
var matrix = matrix || {};


/*
 Gauß-Jordan algorithm to invert a matrix
 assumes that m is a quadratic and reversible matrix
 the input parameter is not mutated; code taken from:
 https://github.com/Archistar/archistar-smc/blob/master/src/main/java/at/archistar/crypto/math/GenericMatrix.java
*/
matrix.inverse = function (m) {
  'use strict';
  var size = m.length;
  var res = matrix.generate_identity(size);
  var tmp = matrix.deep_copy(m);

  for (var i = 0; i < size; i++) {

    if (tmp[i][i] === 0 && !matrix.find_and_swap_nonzero_in_row(i, size, tmp, res)) {
      size = size - 1;
    }

    matrix.normalize_row(tmp[i], res[i], gf256.inverse(tmp[i][i]));

    for (var j = 0; j < size; j++) {
      if (j === i) {continue;}
      var coeff = tmp[j][i];
      if (coeff === 0) {continue;}
      matrix.mult_and_subtract(tmp[j], tmp[i], coeff);
      matrix.mult_and_subtract(res[j], res[i], coeff);
    }
  }

  // we could assert here that tmp is now an identity matrix

  return res;
};

matrix.mult_and_subtract = function (row, normalized, coeff) {
  var length = row.length;
  for (var i = 0; i < length; i++) {
    row[i] = gf256.sub(row[i], gf256.mult(normalized[i], coeff));
  }
};

matrix.normalize_row = function (tmp_row, res_row, element) {
  var length = tmp_row.length;
  for (var i = 0; i < length; i++) {
    tmp_row[i] = gf256.mult(tmp_row[i], element);
    res_row[i] = gf256.mult(res_row[i], element);
  }
};

matrix.find_and_swap_nonzero_in_row = function (i, num_rows, tmp, res) {
  for (var j = i + 1; j < num_rows; j++) {
    if (tmp[j][i] !== 0) {
      matrix.swap_rows(tmp, i, j);
      matrix.swap_rows(res, i, j);
      return true;
    }
  }
  return false;
};

matrix.swap_rows = function (matrix, first, second) {
  var tmp = matrix[first];
  matrix[first] = matrix[second];
  matrix[second] = tmp;
};

matrix.generate_identity = function (size) {
  var res = [];
  for (var i = 0; i < size; i++) {
    res[i] = [];
    for (var j = 0; j < size; j++) {
      if (i === j) {
        res[i][j] = 1;
      } else {
        res[i][j] = 0;
      }
    }
  }
  return res;
};

matrix.deep_copy = function (m) {
  var res = [];
  var rows = m.length;
  for (var i = 0; i < rows; i++) {
    res [i] = [];
    var columns = m[i].length;
    for (var j = 0; j < columns; j++) {
      res[i][j] = m[i][j];
    }
  }
  return res;
};

matrix.is_identity = function (m) {
  var size = m.length;
  for (var i = 0; i < size; i++) {
    if (m[i].length !== size) {return false;}
    for (var j = 0; j < size; j++) {
      if (i === j && m[i][j] !== 1) {return false;}
      if (i !== j && m[i][j] !== 0) {return false;}
    }
  }
  return true;
};

matrix.multiply = function (a, b) {
  var res = [];
  var a_rows = a.length;
  var a_columns = a[0].length;
  var b_columns = b[0].length;
  for (var i0 = 0; i0 < a_rows; i0++) {
    res [i0] = [];
    for (var k0 = 0; k0 < b_columns; k0++) {
      res[i0][k0] = 0;
    }
  }

  for (var j = 0; j < a_columns; j++) {
    for (var i = 0; i < a_rows; i++) {
      for (var k = 0; k < b_columns; k++) {
        res[i][k] = gf256.add(res[i][k], gf256.mult(a[i][j], b[j][k]));
      }
    }
  }

  return res;
};

matrix.multiply_vector = function (m, v) {
  var res = [];
  var length = v.length;
  for (var i = 0; i < length; i++) {
    var tmp = 0;
    for (var j = 0; j < length; j++) {
      tmp = gf256.add(tmp, gf256.mult(m[i][j], v[j]));
    }
    res[i] = tmp;
  }
  return res;
};

matrix.generate_decoder = function (size, values) {
  var res = new Array(size);
  for (var i = 0; i < size; i++) {
    res[i] = new Uint8Array(size);
    for (var j = 0; j < size; j++) {
      res[i][j] = gf256.pow(values[i], j);
    }
  }
  return matrix.inverse(res);
};
