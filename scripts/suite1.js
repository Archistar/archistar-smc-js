/*
just copied over some tests to see how to use the sripts in the browser
*/
suite1 = {
    'tables' : function (test) {
      'use strict';
      test.expect(1);
      var table = require('../src/table');
      test.notEqual(table.alogtable, undefined);
      test.done();
    },
    'example test': function (test) {
        'use strict';
        test.expect(65280);
        var gf256 = require('../src/gf256');
        for (let a = 0; a <= 255; a++) {
          for (let b = 1; b <= 255; b++) {
            let q = gf256.div(a, b);
            let p = gf256.mult(q, b);
            test.equal(a, p);
          }
        }
        test.done();
    }
};
