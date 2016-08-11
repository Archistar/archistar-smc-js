(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
imitates the functionality of window.crypto.getRandomValues(), but always returns the same values for testing purposes
*/

var fake_rng = fake_rng || {};

fake_rng.get_values_4 = function(a) {
  for (var i = 0; i < a.length; i++) {
     a[i] = 4;
  }
};

fake_rng.get_values = function(a) {
  for (var i = 0; i < a.length; i++) {
    a[i] = fake_rng.source[i];
  }
};

fake_rng.source = new Uint8Array([14,248,105,92,41,81,81,18,211,51,30,225,159,144,254,52,130,122,191,39,83,150,67,26,41,50,143,119,34,217,244,208,38,255,51,119,188,140,34,57,104,190,166,110,115,60,98,30,113,51,94,243,81,15,12,30,103,65,128,142,100,29,181,73,148,227,188,157,60,201,239,227,137,184,197,216,25,85,122,182,149,87,12,91,115,72,79,30,129,199,148,133,58,254,63,106,84,201,92,186]);

},{}],2:[function(require,module,exports){
/*
this is a straight translation of the java class:
https://github.com/Archistar/archistar-smc/blob/master/src/main/java/at/archistar/crypto/math/gf256/GF256.java

the lookup tables from the original are pregenerated into a separate file
*/

var gf256 = module.exports;

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
  return table.alogtable[table.logtable[a] + table.logtable[b]];
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
  const degree = coeffs.length - 1;
  let result = coeffs[degree];

  for (let i = degree - 1; i >= 0; i--){
    result = gf256.add(gf256.mult(result, x), coeffs[i]);
  }
  return result;
};

},{"./table.js":8}],3:[function(require,module,exports){
/*
an implementation of Krawczyk's Computationally Secure Secret Sharing
http://courses.csail.mit.edu/6.857/2009/handouts/short-krawczyk.pdf
*/
var krawczyk_css = krawczyk_css || {};

krawczyk_css.Configuration = function (shares, quorum, random) {
  this.shares = shares;
  this.quorum = quorum;
  this.random = random;
  this.rabin = new rabin_ids.Configuration(shares, quorum);
  this.shamir = new shamir_pss.Configuration(shares, quorum, random);
  this.encode = function (secret) {
    var key_nonce = new Uint8Array(40);
    window.crypto.getRandomValues(key_nonce);
    console.log(key_nonce);
    var encrypted_secret = salsa20.code(key_nonce.slice(0,32), key_nonce.slice(32,40), secret);
    var shs = this.rabin.encode(encrypted_secret);
    var key_nonce_shares = this.shamir.encode(key_nonce);
    for (var i = 0; i < this.shares; i++) {
      shs[i].key_nonce_data = key_nonce_shares[i];
    }
    return shs;
  };
  this.decode = function (shs) {
    var key_nonce_data = new Array(shs.length);
    for (var i = 0; i < shs.length; i++) {
      key_nonce_data[i] = shs[i].key_nonce_data;
    }
    var key_nonce = this.shamir.decode(key_nonce_data);
    var encrypted_text = this.rabin.decode(shs);
    var decrypted_text = salsa20.code(key_nonce.slice(0,32), key_nonce.slice(32,40), encrypted_text);
    return decrypted_text;
  };
};

},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
/*
this is a simple implementation of Rabin IDS;
code is mostly taken from the Java version:
https://github.com/Archistar/archistar-smc/blob/master/src/main/java/at/archistar/crypto/secretsharing/RabinIDS.java
*/

var rabin_ids = rabin_ids || {};

// random is a source that implements the functionality of window.crypto.getRandomValues()
// if it is undefined, window.crypto.getRandomValues() will be used
rabin_ids.Configuration = function (shares, quorum) {
  this.shares = shares;
  this.quorum = quorum;
  this.encode = function (secret) {
    'use strict';
    var chunks = Math.ceil(secret.length / this.quorum);
    var shs = [];
    for (var k = 0; k < this.shares; k++) {shs[k] = {data: [], degree: k + 1, original_length: secret.length};}
    var i = 0;

    for (var chunk = 0; chunk < chunks; chunk++) {
      var coeffs = [];
      for (var j = 0; j < this.quorum; j++) {
        if (secret[i] !== undefined) {
          coeffs[j] = secret[i];
          i++;
        } else {
          coeffs[j] = 0;
        }
      }
      for (var n = 0; n < this.shares; n++) {
        shs[n].data[chunk] = gf256.evaluateAt(coeffs, n + 1);
      }
    }

    return shs;
  };
  this.decode = function (shs) {
    'use strict';
    var xvalues = new Uint8Array(shs.length);
    for (var i0 = 0; i0 < shs.length; i0++) {xvalues[i0] = shs[i0].degree;}
    var decoder = matrix.generate_decoder(this.quorum, xvalues);
    var secret = [];
    var length = shs[0].data.length;
    var original_length = shs[0].original_length;
    for (var i = 0; i < length; i++) {
      var yvalues = [];
      for (var i2 = 0; i2 < this.quorum; i2++) {yvalues[i2] = shs[i2].data[i];}
      var decoded = matrix.multiply_vector(decoder, yvalues);
      if (secret.length + decoded.length < original_length) {
        secret = secret.concat(decoded);
      } else {
        for (var i1 = 0; secret.length < original_length; i1++) {
          secret.push(decoded[i1]);
        }
        break;
      }
    }
    return secret;
  };
};

},{}],6:[function(require,module,exports){
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

/*
use this to encrypt and decrypt with Salsa20
keys is Uint8Array of length 32 (that means: we only use Salsa20 with 32 byte keys)
nonce is Uint8Array of length 8
text is Uint8Array of length l % 64 == 0
*/
salsa20.code = function (key, nonce, text) {
  var res = new Uint8Array(text.length);
  var index = 0;
  var length = text.length;
  var key32 = new Uint32Array(8);
  var nonce32 = new Uint32Array(2);
  for (var i0 = 0; i0 < 8; i0++) {
      key32[i0] = salsa20.littleendian(key[i0*4], key[i0*4+1], key[i0*4+2], key[i0*4+3]);
    }
  nonce32[0] = salsa20.littleendian(nonce[0], nonce[1], nonce[2], nonce[3]);
  nonce32[1] = salsa20.littleendian(nonce[4], nonce[5], nonce[6], nonce[7]);
  for (var block = 0; block < length; block = block + 64) {
    var expanded = salsa20.salsa20_k32(key32, [nonce32[0], nonce32[1], 0, block]);
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

},{}],7:[function(require,module,exports){
/*
implements Shamir Perfect Secret Sharing
*/

var shamir_pss = shamir_pss || {};

// random is a source that implements the functionality of window.crypto.getRandomValues()
// if it is undefined, window.crypto.getRandomValues() will be used
shamir_pss.Configuration = function (shares, quorum, random) {
  this.shares = shares;
  this.quorum = quorum;
  this.random = random;
  this.encode = function (secret) {
    'use strict';
    var shs = [];
    for (var k = 0; k < this.shares; k++) {shs[k] = {data: [], degree: k + 1};}
    for (var i = 0; i < secret.length; i++) {
      var coeffs = new Uint8Array(quorum);
      if (this.random === undefined) {
        window.crypto.getRandomValues(coeffs);
      } else {
        this.random(coeffs);
      }
      coeffs[0] = secret[i];
      for (var n = 0; n < this.shares; n++) {
        shs[n].data[i] = gf256.evaluateAt(coeffs, n + 1);
      }
    }
    return shs;
  };
  this.decode = function (shs) {
    'use strict';
    var xvalues = [];
    for (var i0 = 0; i0 < shs.length; i0++) {xvalues[i0] = shs[i0].degree;}
    var decoder = matrix.generate_decoder(this.quorum, xvalues);
    var secret = [];
    var length = shs[0].data.length;
    for (var i = 0; i < length; i++) {
      var yvalues = [];
      for (var i2 = 0; i2 < this.quorum; i2++) {yvalues[i2] = shs[i2].data[i];}
      var decoded = matrix.multiply_vector(decoder, yvalues);
      secret.push(decoded[0]);
    }
    return secret;
  };
};

},{}],8:[function(require,module,exports){
var gf256 = module.exports;

gf256.logtable = [512,255,1,25,2,50,26,198,3,223,51,238,27,104,199,75,4,100,224,14,52,141,239,129,28,193,105,248,200,8,76,113,5,138,101,47,225,36,15,33,53,147,142,218,240,18,130,69,29,181,194,125,106,39,249,185,201,154,9,120,77,228,114,166,6,191,139,98,102,221,48,253,226,152,37,179,16,145,34,136,54,208,148,206,143,150,219,189,241,210,19,92,131,56,70,64,30,66,182,163,195,72,126,110,107,58,40,84,250,133,186,61,202,94,155,159,10,21,121,43,78,212,229,172,115,243,167,87,7,112,192,247,140,128,99,13,103,74,222,237,49,197,254,24,227,165,153,119,38,184,180,124,17,68,146,217,35,32,137,46,55,63,209,91,149,188,207,205,144,135,151,178,220,252,190,97,242,86,211,171,20,42,93,158,132,60,57,83,71,109,65,162,31,45,67,216,183,123,164,118,196,23,73,236,127,12,111,246,108,161,59,82,41,157,85,170,251,96,134,177,187,204,62,90,203,89,95,176,156,169,160,81,11,245,22,235,122,117,44,215,79,174,213,233,230,231,173,232,116,214,244,234,168,80,88,175];

gf256.alogtable = [1,2,4,8,16,32,64,128,29,58,116,232,205,135,19,38,76,152,45,90,180,117,234,201,143,3,6,12,24,48,96,192,157,39,78,156,37,74,148,53,106,212,181,119,238,193,159,35,70,140,5,10,20,40,80,160,93,186,105,210,185,111,222,161,95,190,97,194,153,47,94,188,101,202,137,15,30,60,120,240,253,231,211,187,107,214,177,127,254,225,223,163,91,182,113,226,217,175,67,134,17,34,68,136,13,26,52,104,208,189,103,206,129,31,62,124,248,237,199,147,59,118,236,197,151,51,102,204,133,23,46,92,184,109,218,169,79,158,33,66,132,21,42,84,168,77,154,41,82,164,85,170,73,146,57,114,228,213,183,115,230,209,191,99,198,145,63,126,252,229,215,179,123,246,241,255,227,219,171,75,150,49,98,196,149,55,110,220,165,87,174,65,130,25,50,100,200,141,7,14,28,56,112,224,221,167,83,166,81,162,89,178,121,242,249,239,195,155,43,86,172,69,138,9,18,36,72,144,61,122,244,245,247,243,251,235,203,139,11,22,44,88,176,125,250,233,207,131,27,54,108,216,173,71,142,1,2,4,8,16,32,64,128,29,58,116,232,205,135,19,38,76,152,45,90,180,117,234,201,143,3,6,12,24,48,96,192,157,39,78,156,37,74,148,53,106,212,181,119,238,193,159,35,70,140,5,10,20,40,80,160,93,186,105,210,185,111,222,161,95,190,97,194,153,47,94,188,101,202,137,15,30,60,120,240,253,231,211,187,107,214,177,127,254,225,223,163,91,182,113,226,217,175,67,134,17,34,68,136,13,26,52,104,208,189,103,206,129,31,62,124,248,237,199,147,59,118,236,197,151,51,102,204,133,23,46,92,184,109,218,169,79,158,33,66,132,21,42,84,168,77,154,41,82,164,85,170,73,146,57,114,228,213,183,115,230,209,191,99,198,145,63,126,252,229,215,179,123,246,241,255,227,219,171,75,150,49,98,196,149,55,110,220,165,87,174,65,130,25,50,100,200,141,7,14,28,56,112,224,221,167,83,166,81,162,89,178,121,242,249,239,195,155,43,86,172,69,138,9,18,36,72,144,61,122,244,245,247,243,251,235,203,139,11,22,44,88,176,125,250,233,207,131,27,54,108,216,173,71,142,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

},{}],9:[function(require,module,exports){
exports.tables = function(test) {
  'use strict';
  test.expect(2);
  const table = require('./../src/table.js');
  test.notStrictEqual(table.alogtable, undefined, "does alogtable exist?");
  test.notStrictEqual(table.logtable, undefined, "does logtable exist?");
  test.done();
};


exports.inverse_identity = function(test) {
  'use strict';
  test.expect(255);
  const gf256 = require('./../src/gf256.js');
  for (let a = 1; a <= 255; a++) {
    test.equal(gf256.mult(a, gf256.inverse(a)), 1);
  }
  test.done();
};

// direct translation of:
// https://github.com/Archistar/archistar-smc/blob/master/src/test/java/at/archistar/crypto/math/TestGF256Algebra.java
exports.mul_div_identity = function(test) {
  'use strict';
  test.expect(65280);
  const gf256 = require('./../src/gf256.js');
  for (let a = 0; a <= 255; a++) {
    for (let b = 1; b <= 255; b++) {
      let q = gf256.div(a, b);
      let p = gf256.mult(q, b);
      test.equal(a, p);
    }
  }
  test.done();
};

exports.rolling_product = function(test) {
  'use strict';
  test.expect(65280);
  const gf256 = require('./../src/gf256.js');
  for (let a = 1; a <= 255; a++) {
    let product = 1;
    for (let p = 0; p <= 255; p++) {
      let r = gf256.pow(a, p);
      test.equal(r, product);
      product = gf256.mult(product, a);
    }
  }
  test.done();
};

},{"./../src/gf256.js":2,"./../src/table.js":8}]},{},[1,2,3,4,5,6,7,8,9]);
