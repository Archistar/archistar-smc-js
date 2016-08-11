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
