exports.add = function(test) {
  'use strict';
  test.expect(1);
  const t = require('./../dist/test.js');
  test.equal(t.salsa20.add(0xc0a8787e, 0x9fd1161d), 0x60798e9b);
  test.done();
};

exports.xor = function(test) {
  'use strict';
  test.expect(1);
  test.equal((0xc0a8787e ^ 0x9fd1161d), 0x5f796e63);
  test.done();
};

exports.rotate_left = function(test) {
  'use strict';
  test.expect(1);
  const t = require('./../dist/test.js');
  test.equal(t.salsa20.rotl(0xc0a8787e, 5), 0x150f0fd8);
  test.done();
};

exports.quarterround = function(test) {
  'use strict';
  test.expect(7);
  const t = require('./../dist/test.js');

  const a1 = new Uint32Array([0x00000000,0x00000000,0x00000000,0x00000000]);
  t.salsa20.quarterround(a1, 0, 1, 2, 3);
  test.deepEqual(a1, new Uint32Array([0x00000000,0x00000000,0x00000000,0x00000000]));

  const a2 = new Uint32Array([0x00000001,0x00000000,0x00000000,0x00000000]);
  t.salsa20.quarterround(a2, 0, 1, 2, 3);
  test.deepEqual(a2, new Uint32Array([0x08008145,0x00000080,0x00010200,0x20500000]));

  const a3 = new Uint32Array([0x00000000,0x00000001,0x00000000,0x00000000]);
  t.salsa20.quarterround(a3, 0, 1, 2, 3);
  test.deepEqual(a3, new Uint32Array([0x88000100,0x00000001,0x00000200,0x00402000]));

  const a4 = new Uint32Array([0x00000000,0x00000000,0x00000001,0x00000000]);
  t.salsa20.quarterround(a4, 0, 1, 2, 3);
  test.deepEqual(a4, new Uint32Array([0x80040000,0x00000000,0x0000001,0x00002000]));

  const a5 = new Uint32Array([0x00000000,0x00000000,0x00000000,0x00000001]);
  t.salsa20.quarterround(a5, 0, 1, 2, 3);
  test.deepEqual(a5, new Uint32Array([0x00048044,0x00000080,0x00010000,0x20100001]));

  const a6 = new Uint32Array([0xe7e8c006,0xc4f9417d,0x6479b4b2,0x68c67137]);
  t.salsa20.quarterround(a6, 0, 1, 2, 3);
  test.deepEqual(a6, new Uint32Array([0xe876d72b,0x9361dfd5,0xf1460244,0x948541a3]));

  const a7 = new Uint32Array([0xd3917c5b,0x55f1c407,0x52a58a7a,0x8f887a3b]);
  t.salsa20.quarterround(a7, 0, 1, 2, 3);
  test.deepEqual(a7, new Uint32Array([0x3e2f308c,0xd90a8f36,0x6ab2a923,0x2883524c]));

  test.done();
};

exports.rowround = function(test) {
  'use strict';
  test.expect(2);
  const t = require('./../dist/test.js');

  const a1 = new Uint32Array([
        0x00000001, 0x00000000, 0x00000000, 0x00000000,
        0x00000001, 0x00000000, 0x00000000, 0x00000000,
        0x00000001, 0x00000000, 0x00000000, 0x00000000,
        0x00000001, 0x00000000, 0x00000000, 0x00000000
      ]);
  t.salsa20.rowround(a1);
  test.deepEqual(a1, new Uint32Array([
        0x08008145, 0x00000080, 0x00010200, 0x20500000,
        0x20100001, 0x00048044, 0x00000080, 0x00010000,
        0x00000001, 0x00002000, 0x80040000, 0x00000000,
        0x00000001, 0x00000200, 0x00402000, 0x88000100
      ]));

  const a2 = new Uint32Array([
        0x08521bd6, 0x1fe88837, 0xbb2aa576, 0x3aa26365,
        0xc54c6a5b, 0x2fc74c2f, 0x6dd39cc3, 0xda0a64f6,
        0x90a2f23d, 0x067f95a6, 0x06b35f61, 0x41e4732e,
        0xe859c100, 0xea4d84b7, 0x0f619bff, 0xbc6e965a
      ]);
  t.salsa20.rowround(a2);
  test.deepEqual(a2, new Uint32Array([
        0xa890d39d, 0x65d71596, 0xe9487daa, 0xc8ca6a86,
        0x949d2192, 0x764b7754, 0xe408d9b9, 0x7a41b4d1,
        0x3402e183, 0x3c3af432, 0x50669f96, 0xd89ef0a8,
        0x0040ede5, 0xb545fbce, 0xd257ed4f, 0x1818882d
      ]));

  test.done();
};

exports.columnround = function(test) {
  'use strict';
  test.expect(2);
  const t = require('./../dist/test.js');

  const a1 = new Uint32Array([
        0x00000001, 0x00000000, 0x00000000, 0x00000000,
        0x00000001, 0x00000000, 0x00000000, 0x00000000,
        0x00000001, 0x00000000, 0x00000000, 0x00000000,
        0x00000001, 0x00000000, 0x00000000, 0x00000000
      ]);
  t.salsa20.columnround(a1);
  test.deepEqual(a1, new Uint32Array([
        0x10090288, 0x00000000, 0x00000000, 0x00000000,
        0x00000101, 0x00000000, 0x00000000, 0x00000000,
        0x00020401, 0x00000000, 0x00000000, 0x00000000,
        0x40a04001, 0x00000000, 0x00000000, 0x00000000
      ]));

  const a2 = new Uint32Array([
        0x08521bd6, 0x1fe88837, 0xbb2aa576, 0x3aa26365,
        0xc54c6a5b, 0x2fc74c2f, 0x6dd39cc3, 0xda0a64f6,
        0x90a2f23d, 0x067f95a6, 0x06b35f61, 0x41e4732e,
        0xe859c100, 0xea4d84b7, 0x0f619bff, 0xbc6e965a
      ]);
  t.salsa20.columnround(a2);
  test.deepEqual(a2, new Uint32Array([
        0x8c9d190a, 0xce8e4c90, 0x1ef8e9d3, 0x1326a71a,
        0x90a20123, 0xead3c4f3, 0x63a091a0, 0xf0708d69,
        0x789b010c, 0xd195a681, 0xeb7d5504, 0xa774135c,
        0x481c2027, 0x53a8e4b5, 0x4c1f89c5, 0x3f78c9c8
      ]));

  test.done();
};

exports.doubleround = function(test) {
  'use strict';
  test.expect(2);
  const t = require('./../dist/test.js');

  const a1 = new Uint32Array([
        0x00000001, 0x00000000, 0x00000000, 0x00000000,
        0x00000000, 0x00000000, 0x00000000, 0x00000000,
        0x00000000, 0x00000000, 0x00000000, 0x00000000,
        0x00000000, 0x00000000, 0x00000000, 0x00000000
      ]);
  t.salsa20.doubleround(a1);
  test.deepEqual(a1, new Uint32Array([
        0x8186a22d, 0x0040a284, 0x82479210, 0x06929051,
        0x08000090, 0x02402200, 0x00004000, 0x00800000,
        0x00010200, 0x20400000, 0x08008104, 0x00000000,
        0x20500000, 0xa0000040, 0x0008180a, 0x612a8020
      ]));
  const a2 = new Uint32Array([
        0xde501066, 0x6f9eb8f7, 0xe4fbbd9b, 0x454e3f57,
        0xb75540d3, 0x43e93a4c, 0x3a6f2aa0, 0x726d6b36,
        0x9243f484, 0x9145d1e8, 0x4fa9d247, 0xdc8dee11,
        0x054bf545, 0x254dd653, 0xd9421b6d, 0x67b276c1
      ]);
  t.salsa20.doubleround(a2);
  test.deepEqual(a2, new Uint32Array([
        0xccaaf672, 0x23d960f7, 0x9153e63a, 0xcd9a60d0,
        0x50440492, 0xf07cad19, 0xae344aa0, 0xdf4cfdfc,
        0xca531c29, 0x8e7943db, 0xac1680cd, 0xd503ca00,
        0xa74b2ad6, 0xbc331c5c, 0x1dda24c7, 0xee928277
      ]));

  test.done();
};

exports.littleendian = function(test) {
  'use strict';
  test.expect(6);
  const t = require('./../dist/test.js');
  test.equal(t.salsa20.littleendian(0,0,0,0), 0x00000000);
  test.equal(t.salsa20.littleendian(86,75,30,9), 0x091e4b56);
  test.equal(t.salsa20.littleendian(255,255,255,250), 0xfaffffff);
  test.deepEqual(t.salsa20.littleendian_rev(0x00000000), (new Uint8Array([0,0,0,0])));
  test.deepEqual(t.salsa20.littleendian_rev(0x091e4b56), (new Uint8Array([86,75,30,9])));
  test.deepEqual(t.salsa20.littleendian_rev(0xfaffffff), (new Uint8Array([255,255,255,250])));
  test.done();
};

exports.salsa20 = function(test) {
  'use strict';
  test.expect(3);
  const t = require('./../dist/test.js');

  const a1_a = new Uint32Array([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
  const a1_b = Uint32Array.from(a1_a);
  t.salsa20.salsa20(a1_a, a1_b);
  test.deepEqual(a1_a, new Uint32Array([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]));

  const a2_a = new Uint32Array([
        t.salsa20.littleendian(211,159,13,115), t.salsa20.littleendian(76,55,82,183), t.salsa20.littleendian(3,117,222,37), t.salsa20.littleendian(191,187,234,136),
        t.salsa20.littleendian(49,237,179,48), t.salsa20.littleendian(1,106,178,219), t.salsa20.littleendian(175,199,166,48), t.salsa20.littleendian(86,16,179,207),
        t.salsa20.littleendian(31,240,32,63), t.salsa20.littleendian(15,83,93,161), t.salsa20.littleendian(116,147,48,113), t.salsa20.littleendian(238,55,204,36),
        t.salsa20.littleendian(79,201,235,79), t.salsa20.littleendian(3,81,156,47), t.salsa20.littleendian(203,26,244,243), t.salsa20.littleendian(88,118,104,54)]);
  const a2_b = Uint32Array.from(a2_a);
  t.salsa20.salsa20(a2_a, a2_b);
  test.deepEqual(a2_a, new Uint32Array([
        t.salsa20.littleendian(109,42,178,168), t.salsa20.littleendian(156,240,248,238), t.salsa20.littleendian(168,196,190,203), t.salsa20.littleendian(26,110,170,154),
        t.salsa20.littleendian(29,29,150,26), t.salsa20.littleendian(150,30,235,249), t.salsa20.littleendian(190,163,251,48), t.salsa20.littleendian(69,144,51,57),
        t.salsa20.littleendian(118,40,152,157), t.salsa20.littleendian(180,57,27,94), t.salsa20.littleendian(107,42,236,35), t.salsa20.littleendian(27,111,114,114),
        t.salsa20.littleendian(219,236,232,135), t.salsa20.littleendian(111,155,110,18), t.salsa20.littleendian(24,232,95,158), t.salsa20.littleendian(179,19,48,202)
        ]));

  const a3_a = new Uint32Array([
        t.salsa20.littleendian(88,118,104,54), t.salsa20.littleendian(79,201,235,79), t.salsa20.littleendian(3,81,156,47), t.salsa20.littleendian(203,26,244,243),
        t.salsa20.littleendian(191,187,234,136), t.salsa20.littleendian(211,159,13,115), t.salsa20.littleendian(76,55,82,183), t.salsa20.littleendian(3,117,222,37),
        t.salsa20.littleendian(86,16,179,207), t.salsa20.littleendian(49,237,179,48), t.salsa20.littleendian(1,106,178,219), t.salsa20.littleendian(175,199,166,48),
        t.salsa20.littleendian(238,55,204,36), t.salsa20.littleendian(31,240,32,63), t.salsa20.littleendian(15,83,93,161), t.salsa20.littleendian(116,147,48,113)]);
  const a3_b = Uint32Array.from(a3_a);
  t.salsa20.salsa20(a3_a, a3_b);
  test.deepEqual(a3_a, new Uint32Array([
        t.salsa20.littleendian(179,19,48,202), t.salsa20.littleendian(219,236,232,135), t.salsa20.littleendian(111,155,110,18), t.salsa20.littleendian(24,232,95,158),
        t.salsa20.littleendian(26,110,170,154), t.salsa20.littleendian(109,42,178,168), t.salsa20.littleendian(156,240,248,238), t.salsa20.littleendian(168,196,190,203),
        t.salsa20.littleendian(69,144,51,57), t.salsa20.littleendian(29,29,150,26), t.salsa20.littleendian(150,30,235,249), t.salsa20.littleendian(190,163,251,48),
        t.salsa20.littleendian(27,111,114,114), t.salsa20.littleendian(118,40,152,157), t.salsa20.littleendian(180,57,27,94), t.salsa20.littleendian(107,42,236,35)
        ]));

  test.done();
};

exports.salsa20_k32 = function(test) {
  'use strict';
  test.expect(1);
  const t = require('./../dist/test.js');
  test.deepEqual(t.salsa20.salsa20_k32(
          new Uint32Array([
            t.salsa20.littleendian(1,2,3,4), t.salsa20.littleendian(5,6,7,8), t.salsa20.littleendian(9,10,11,12), t.salsa20.littleendian(13,14,15,16),
            t.salsa20.littleendian(201,202,203,204), t.salsa20.littleendian(205,206,207,208), t.salsa20.littleendian(209,210,211,212), t.salsa20.littleendian(213,214,215,216)
          ]),
          new Uint32Array([
            t.salsa20.littleendian(101,102,103,104), t.salsa20.littleendian(105,106,107,108), t.salsa20.littleendian(109,110,111,112), t.salsa20.littleendian(113,114,115,116)
          ])),
        new Uint32Array([
        t.salsa20.littleendian(69,37,68,39), t.salsa20.littleendian(41,15,107,193), t.salsa20.littleendian(255,139,122,6), t.salsa20.littleendian(170,233,217,98),
        t.salsa20.littleendian(89,144,182,106), t.salsa20.littleendian(21,51,200,65), t.salsa20.littleendian(239,49,222,34), t.salsa20.littleendian(215,114,40,126),
        t.salsa20.littleendian(104,197,7,225), t.salsa20.littleendian(197,153,31,2), t.salsa20.littleendian(102,78,76,176), t.salsa20.littleendian(84,245,246,184),
        t.salsa20.littleendian(177,160,133,130), t.salsa20.littleendian(6,72,149,119), t.salsa20.littleendian(192,195,132,236), t.salsa20.littleendian(234,103,246,74)
        ])
      );
  test.done();
};

exports.code0 = function(test) {
  'use strict';
  test.expect(512);
  const t = require('./../dist/test.js');
  const crypto = require('crypto');
  for (let i = 1; i <= 256; i++) {
    const key = crypto.randomBytes(32);
    const nonce = crypto.randomBytes(8);
    const text = crypto.randomBytes(i);
    const encrypted = t.salsa20.code(key, nonce, text);
    const decrypted = t.salsa20.code(key, nonce, encrypted);
    test.notDeepEqual(encrypted, decrypted);
    test.deepEqual(decrypted, text);
  }
  test.done();
};

exports.code = function(test) {
  'use strict';
  test.expect(260);
  const t = require('./../dist/test.js');
  const crypto = require('crypto');
  const key = crypto.randomBytes(32);
  const nonce = crypto.randomBytes(8);
  const text = crypto.randomBytes(130);
  for (let i = 0; i < 130; i++) {
    const slice0 = text.subarray(i, 130).slice();
    const slice1 = text.subarray(i, 130).slice();
    const encrypted = t.salsa20.code(key, nonce, slice0);
    const decrypted = t.salsa20.code(key, nonce, encrypted);
    test.notDeepEqual(encrypted, decrypted);
    test.deepEqual(decrypted, slice1);
  }
  test.done();
};

exports.cross = function(test) {
  'use strict';
  test.expect(1);
  const t = require('./../dist/test.js');
  const crypto = require('crypto');
  const key = new Uint8Array([1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]);
  const nonce = new Uint8Array([2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]);
  const text = new Uint8Array([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]);
  const encrypted = t.salsa20.code(key, nonce, text);
  test.deepEqual(encrypted, new Uint8Array([162, 211, 251, 45, 41, 173, 12, 40, 159, 161, 33, 174, 98, 203, 149]));
  test.done();
};
