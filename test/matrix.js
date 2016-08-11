exports.does_it_even_work = function(test) {
  'use strict';
  test.expect(3);
  const matrix = require('./../src/matrix.js');
  test.deepEqual(matrix.inverse([]), ([]));
  test.ok(matrix.is_identity(matrix.generate_identity(3)));
  const t1 = [[1,2],[2,3]];
  test.ok(matrix.is_identity(matrix.multiply(t1, matrix.inverse(t1))));
  test.done();
};