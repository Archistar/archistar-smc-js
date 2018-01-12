exports.roundtrip_4_3 = function(test) {
  'use strict';
  const t = require('./../dist/test.js');
  const shamir = new t.shamir_pss.Configuration(4, 3, () => 4);
  const shamir_noasm = new t.shamir_pss_noasm.Configuration(4, 3, () => 4);
  const text = new Uint8Array([2,3,56,32,57,124,45,34,98,61,1,9,123,233,210,198]);
  test.expect(text.length * 5);
  for (let end = 1; end <= text.length; end++) {
    let trunc = text.subarray(0, end);
    let res = shamir.encode(trunc);
    test.deepEqual(shamir.decode(res), trunc);
    test.deepEqual(shamir.decode([res[0],res[1],res[2]]), trunc);
    test.deepEqual(shamir.decode([res[0],res[1],res[3]]), trunc);
    test.deepEqual(shamir.decode([res[0],res[2],res[3]]), trunc);
    test.deepEqual(shamir.decode([res[1],res[2],res[3]]), trunc);
  }
  test.done();
};

exports.roundtrip_10_6 = function(test) {
  'use strict';
  const t = require('./../dist/test.js');
  const shamir = new t.shamir_pss.Configuration(10, 6, () => 4);
  const text = new Uint8Array([2,3,56,32,57,124,45,34,98,61,1,9,123,233,210,198]);
  test.expect(text.length);
  for (let end = 1; end <= text.length; end++) {
    let trunc = text.subarray(0, end);
    let res = shamir.encode(trunc);
    test.deepEqual(shamir.decode(res), trunc);
  }
  test.done();
};

exports.roundtrip_4_3_realRNG = function(test) {
  'use strict';
  const t = require('./../dist/test.js');
  const shamir = new t.shamir_pss.Configuration(4, 3);
  const text = new Uint8Array([2,3,56,32,57,124,45,34,98,61,1,9,123,233,210,198]);
  test.expect(text.length * 5);
  for (let end = 1; end <= text.length; end++) {
    let trunc = text.subarray(0, end);
    let res = shamir.encode(trunc);
    test.deepEqual(shamir.decode(res), trunc);
    test.deepEqual(shamir.decode([res[0],res[1],res[2]]), trunc);
    test.deepEqual(shamir.decode([res[0],res[1],res[3]]), trunc);
    test.deepEqual(shamir.decode([res[0],res[2],res[3]]), trunc);
    test.deepEqual(shamir.decode([res[1],res[2],res[3]]), trunc);
  }
  test.done();
};

exports.compare_with_java = function(test) {
  'use strict';
  test.expect(10);
  const t = require('./../dist/test.js');
  const shamir = new t.shamir_pss.Configuration(10, 6, () => 4);
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

exports.compare_asm_and_noasm = function(test) {
  'use strict';
  const crypto = require('crypto');
  const t = require('./../dist/test.js');
  const shamir_asm = new t.shamir_pss.Configuration(4, 3, () => 4);
  const shamir_noasm = new t.shamir_pss_noasm.Configuration(4, 3, () => 4);
  test.expect(640);
  for (let i = 0; i < 128; i++) {
    let text = crypto.randomBytes(i);
    let enc_asm = shamir_asm.encode(text);
    let enc_noasm = shamir_noasm.encode(text);
    test.deepEqual(enc_asm, enc_noasm);
    let dec_asm = shamir_asm.decode(enc_asm);
    let dec_noasm = shamir_noasm.decode(enc_noasm);
    test.deepEqual(dec_asm, text);
    test.deepEqual(dec_noasm, text);
    test.deepEqual(dec_asm, shamir_noasm.decode(enc_asm));
    test.deepEqual(dec_noasm, shamir_asm.decode(enc_noasm));
  }
  test.done();
};
