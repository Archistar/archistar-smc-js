exports.does_it_even_work = function(test) {
  'use strict';
  test.expect(3);
  const t = require('./../dist/test.js');
  test.deepEqual(t.matrix.inverse([]), ([]));
  test.ok(t.matrix.is_identity(t.matrix.generate_identity(3)));
  const t1 = [[1,2],[2,3]];
  test.ok(t.matrix.is_identity(t.matrix.multiply(t1, t.matrix.inverse(t1))));
  test.done();
};
