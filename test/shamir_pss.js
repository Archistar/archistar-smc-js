exports.roundtrip1 = function(test) {
  'use strict';
  test.expect(2);
  const shamir_pss = require('./../src/shamir_pss.js');
  const fake_rng = require('./../src/fake_rng.js');
  const shamir = new shamir_pss.Configuration(10, 6, fake_rng.get_values_4);
  const text = new Uint8Array([2,3,56,32,57,124,45,34,98,61,1,9,123,233,210]);
  const res = shamir.encode(text);
  test.deepEqual(shamir.decode(res), text);
  test.deepEqual(shamir.decode([res[5],res[3],res[8],res[0],res[2],res[6]]), text);
  test.done();
};

exports.roundtrip2 = function(test) {
  'use strict';
  test.expect(2);
  const shamir_pss = require('./../src/shamir_pss.js');
  const fake_rng = require('./../src/fake_rng.js');
  const shamir = new shamir_pss.Configuration(10, 6, fake_rng.get_values_4);
  const text = new Uint8Array([2,3,56,32,57,124,45,34,98,61,1,9,123,233,210,198]);
  const res = shamir.encode(text);
  test.deepEqual(shamir.decode(res), text);
  test.deepEqual(shamir.decode([res[5],res[3],res[8],res[0],res[2],res[6]]), text);
  test.done();
};

exports.roundtrip2_realRNG = function(test) {
  'use strict';
  test.expect(2);
  const shamir_pss = require('./../src/shamir_pss.js');
  const fake_rng = require('./../src/fake_rng.js');
  const shamir = new shamir_pss.Configuration(10, 6);
  const text = new Uint8Array([2,3,56,32,57,124,45,34,98,61,1,9,123,233,210,198]);
  const res = shamir.encode(text);
  test.deepEqual(shamir.decode(res), text);
  test.deepEqual(shamir.decode([res[5],res[3],res[8],res[0],res[2],res[6]]), text);
  test.done();
};

exports.compare_with_java = function(test) {
  'use strict';
  test.expect(10);
  const shamir_pss = require('./../src/shamir_pss.js');
  const fake_rng = require('./../src/fake_rng.js');
  const shamir = new shamir_pss.Configuration(10, 6, fake_rng.get_values_4);
  const text = new Uint8Array([2,3,56,32,57,124,45,34,98,61,1,9,123,233,210,198]);
  const res = shamir.encode(text);
  test.deepEqual(res[0].data, [6,7,60,36,61,120,41,38,102,57,5,13,127,237,214,194]);
  test.deepEqual(res[1].data, [250,251,192,216,193,132,213,218,154,197,249,241,131,17,42,62]);
  test.deepEqual(res[2].data, [174,175,148,140,149,208,129,142,206,145,173,165,215,69,126,106]);
  test.deepEqual(res[3].data, [246,247,204,212,205,136,217,214,150,201,245,253,143,29,38,50]);
  test.deepEqual(res[4].data, [198,199,252,228,253,184,233,230,166,249,197,205,191,45,22,2]);
  test.deepEqual(res[5].data, [59,58,1,25,0,69,20,27,91,4,56,48,66,208,235,255]);
  test.deepEqual(res[6].data, [91,90,97,121,96,37,116,123,59,100,88,80,34,176,139,159]);
  test.deepEqual(res[7].data, [92,93,102,126,103,34,115,124,60,99,95,87,37,183,140,152]);
  test.deepEqual(res[8].data, [86,87,108,116,109,40,121,118,54,105,85,93,47,189,134,146]);
  test.deepEqual(res[9].data, [2,3,56,32,57,124,45,34,98,61,1,9,123,233,210,198]);
  test.done();
};