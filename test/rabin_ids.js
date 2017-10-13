exports.roundtrip1 = function(test) {
  'use strict';
  test.expect(2);
  const t = require('./../dist/test.js');
  const rabin = new t.rabin_ids.Configuration(10, 6);
  const text = new Uint8Array([2,3,56,32,57,124,45,34,98,61,1,9,123,233,210]);
  const res = rabin.encode(text);
  test.deepEqual(rabin.decode(res), text);
  test.deepEqual(rabin.decode([res[5],res[3],res[8],res[0],res[2],res[6]]), text);
  test.done();
};

exports.roundtrip2 = function(test) {
  'use strict';
  test.expect(2);
  const t = require('./../dist/test.js');
  const rabin = new t.rabin_ids.Configuration(10, 6);
  const text = new Uint8Array([2,3,56,32,57,124,45,34,98,61,1,9,123,233,210,198]);
  const res = rabin.encode(text);
  test.deepEqual(rabin.decode(res), text);
  test.deepEqual(rabin.decode([res[5],res[3],res[8],res[0],res[2],res[6]]), text);
  test.done();
};

exports.compare_with_java = function(test) {
  'use strict';
  test.expect(10);
  const t = require('./../dist/test.js');
  const rabin = new t.rabin_ids.Configuration(10, 6);
  const text = new Uint8Array([2,3,56,32,57,124,45,34,98,61,1,9,123,233,210,198]);
  const res = rabin.encode(text);
  test.deepEqual(res[0].data, [92, 88, 134]);
  test.deepEqual(res[1].data, [117, 36, 165]);
  test.deepEqual(res[2].data, [128, 93, 246]);
  test.deepEqual(res[3].data, [205, 222, 142]);
  test.deepEqual(res[4].data, [1, 121, 176]);
  test.deepEqual(res[5].data, [21, 94, 73]);
  test.deepEqual(res[6].data, [114, 245, 217]);
  test.deepEqual(res[7].data, [190, 200, 40]);
  test.deepEqual(res[8].data, [30, 16, 124]);
  test.deepEqual(res[9].data, [25, 230, 160]);
  test.done();
};
