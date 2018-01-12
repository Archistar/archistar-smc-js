exports.roundtrip_4_3 = function(test) {
  'use strict';
  const t = require('./../dist/test.js');
  const rabin = new t.rabin_ids.Configuration(4,3);
  const text = new Uint8Array([2,3,56,32,57,124,45,34,98,61,1,9,123,233,210,198]);
  test.expect(text.length * 5);
  for (let end = 1; end <= text.length; end++) {
    let trunc = text.subarray(0, end);
    let res = rabin.encode(trunc);
    test.deepEqual(rabin.decode(res), trunc);
    test.deepEqual(rabin.decode([res[0],res[1],res[2]]), trunc);
    test.deepEqual(rabin.decode([res[0],res[1],res[3]]), trunc);
    test.deepEqual(rabin.decode([res[0],res[2],res[3]]), trunc);
    test.deepEqual(rabin.decode([res[1],res[2],res[3]]), trunc);
  }
  test.done();
};

exports.roundtrip_10_6 = function(test) {
  'use strict';
  const t = require('./../dist/test.js');
  const rabin = new t.rabin_ids.Configuration(10,6);
  const text = new Uint8Array([2,3,56,32,57,124,45,34,98,61,1,9,123,233,210,198]);
  test.expect(text.length);
  for (let end = 1; end <= text.length; end++) {
    let trunc = text.subarray(0, end);
    let res = rabin.encode(trunc);
    test.deepEqual(rabin.decode(res), trunc);
  }
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

exports.compare_asm_and_noasm = function(test) {
  'use strict';
  const crypto = require('crypto');
  const t = require('./../dist/test.js');
  const rabin_asm = new t.rabin_ids.Configuration(4, 3, () => 4);
  const rabin_noasm = new t.rabin_ids_noasm.Configuration(4, 3, () => 4);
  test.expect(640);
  for (let i = 0; i < 128; i++) {
    let text = crypto.randomBytes(i);
    let enc_asm = rabin_asm.encode(text);
    let enc_noasm = rabin_noasm.encode(text);
    test.deepEqual(enc_asm, enc_noasm);
    let dec_asm = rabin_asm.decode(enc_asm);
    let dec_noasm = rabin_noasm.decode(enc_noasm);
    test.deepEqual(dec_asm, text);
    test.deepEqual(dec_noasm, text);
    test.deepEqual(dec_asm, rabin_noasm.decode(enc_asm));
    test.deepEqual(dec_noasm, rabin_asm.decode(enc_noasm));
  }
  test.done();
};
