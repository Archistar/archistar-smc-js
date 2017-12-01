exports.roundtrip_4_3 = function(test) {
  'use strict';
  const t = require('./../dist/test.js');
  const krawczyk = new t.krawczyk_css.Configuration(4, 3, () => 4);
  const text = new Uint8Array([2,3,56,32,57,124,45,34,98,61,1,9,123,233,210,198]);
  test.expect(text.length * 5);
  for (let end = 1; end <= text.length; end++) {
    let trunc = text.subarray(0, end);
    let res = krawczyk.encode(trunc);
    test.deepEqual(krawczyk.decode(res), trunc);
    test.deepEqual(krawczyk.decode([res[0],res[1],res[2]]), trunc);
    test.deepEqual(krawczyk.decode([res[0],res[1],res[3]]), trunc);
    test.deepEqual(krawczyk.decode([res[0],res[2],res[3]]), trunc);
    test.deepEqual(krawczyk.decode([res[1],res[2],res[3]]), trunc);
  }
  test.done();
};

exports.roundtrip_4_3_realRNG = function(test) {
  'use strict';
  const t = require('./../dist/test.js');
  const krawczyk = new t.krawczyk_css.Configuration(4, 3);
  const text = new Uint8Array([2,3,56,32,57,124,45,34,98,61,1,9,123,233,210,198]);
  test.expect(text.length * 5);
  for (let end = 1; end <= text.length; end++) {
    let trunc = text.subarray(0, end);
    let res = krawczyk.encode(trunc);
    test.deepEqual(krawczyk.decode(res), trunc);
    test.deepEqual(krawczyk.decode([res[0],res[1],res[2]]), trunc);
    test.deepEqual(krawczyk.decode([res[0],res[1],res[3]]), trunc);
    test.deepEqual(krawczyk.decode([res[0],res[2],res[3]]), trunc);
    test.deepEqual(krawczyk.decode([res[1],res[2],res[3]]), trunc);
  }
  test.done();
};

exports.roundtrip1 = function(test) {
  'use strict';
  test.expect(1);
  const t = require('./../dist/test.js');
  const crypto = require('crypto');
  const krawczyk = new t.krawczyk_css.Configuration(10, 6, () => 4);
  const text = crypto.randomBytes(4096);
  const encoded = krawczyk.encode(text);
  const decoded = krawczyk.decode(encoded);
  test.deepEqual(text, decoded);
  test.done();
};

exports.roundtrip1_realRNG = function(test) {
  'use strict';
  test.expect(1);
  const t = require('./../dist/test.js');
  const crypto = require('crypto');
  const krawczyk = new t.krawczyk_css.Configuration(10, 6);
  const text = crypto.randomBytes(4096);
  const encoded = krawczyk.encode(text);
  const decoded = krawczyk.decode(encoded);
  test.deepEqual(text, decoded);
  test.done();
};
