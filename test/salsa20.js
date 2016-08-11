exports.add = function(test) {
  'use strict';
  test.expect(1);
  const salsa20 = require('./../src/salsa20.js');
  test.equal(salsa20.add(0xc0a8787e, 0x9fd1161d), 0x60798e9b);
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
  const salsa20 = require('./../src/salsa20.js');
  test.equal(salsa20.rotl(0xc0a8787e, 5), 0x150f0fd8);
  test.done();
};

exports.quarterround = function(test) {
  'use strict';
  test.expect(7);
  const salsa20 = require('./../src/salsa20.js');
  test.deepEqual(salsa20.quarterround(new Uint32Array([0x00000000,0x00000000,0x00000000,0x00000000])),
                   new Uint32Array([0x00000000,0x00000000,0x00000000,0x00000000]));
  test.deepEqual(salsa20.quarterround(new Uint32Array([0x00000001,0x00000000,0x00000000,0x00000000])),
                   new Uint32Array([0x08008145,0x00000080,0x00010200,0x20500000]));
  test.deepEqual(salsa20.quarterround(new Uint32Array([0x00000000,0x00000001,0x00000000,0x00000000])),
                   new Uint32Array([0x88000100,0x00000001,0x00000200,0x00402000]));
  test.deepEqual(salsa20.quarterround(new Uint32Array([0x00000000,0x00000000,0x00000001,0x00000000])),
                   new Uint32Array([0x80040000,0x00000000,0x0000001,0x00002000]));
  test.deepEqual(salsa20.quarterround(new Uint32Array([0x00000000,0x00000000,0x00000000,0x00000001])),
                   new Uint32Array([0x00048044,0x00000080,0x00010000,0x20100001]));
  test.deepEqual(salsa20.quarterround(new Uint32Array([0xe7e8c006,0xc4f9417d,0x6479b4b2,0x68c67137])),
                   new Uint32Array([0xe876d72b,0x9361dfd5,0xf1460244,0x948541a3]));
  test.deepEqual(salsa20.quarterround(new Uint32Array([0xd3917c5b,0x55f1c407,0x52a58a7a,0x8f887a3b])),
                   new Uint32Array([0x3e2f308c,0xd90a8f36,0x6ab2a923,0x2883524c]));
  test.done();
};

exports.rowround = function(test) {
  'use strict';
  test.expect(2);
  const salsa20 = require('./../src/salsa20.js');
  test.deepEqual(salsa20.rowround(new Uint32Array([
        0x00000001, 0x00000000, 0x00000000, 0x00000000,
        0x00000001, 0x00000000, 0x00000000, 0x00000000,
        0x00000001, 0x00000000, 0x00000000, 0x00000000,
        0x00000001, 0x00000000, 0x00000000, 0x00000000
      ])), new Uint32Array([
        0x08008145, 0x00000080, 0x00010200, 0x20500000,
        0x20100001, 0x00048044, 0x00000080, 0x00010000,
        0x00000001, 0x00002000, 0x80040000, 0x00000000,
        0x00000001, 0x00000200, 0x00402000, 0x88000100
      ]));
  test.deepEqual(salsa20.rowround(new Uint32Array([
        0x08521bd6, 0x1fe88837, 0xbb2aa576, 0x3aa26365,
        0xc54c6a5b, 0x2fc74c2f, 0x6dd39cc3, 0xda0a64f6,
        0x90a2f23d, 0x067f95a6, 0x06b35f61, 0x41e4732e,
        0xe859c100, 0xea4d84b7, 0x0f619bff, 0xbc6e965a
      ])), new Uint32Array([
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
  const salsa20 = require('./../src/salsa20.js');
  test.deepEqual(salsa20.columnround(new Uint32Array([
        0x00000001, 0x00000000, 0x00000000, 0x00000000,
        0x00000001, 0x00000000, 0x00000000, 0x00000000,
        0x00000001, 0x00000000, 0x00000000, 0x00000000,
        0x00000001, 0x00000000, 0x00000000, 0x00000000
      ])), new Uint32Array([
        0x10090288, 0x00000000, 0x00000000, 0x00000000,
        0x00000101, 0x00000000, 0x00000000, 0x00000000,
        0x00020401, 0x00000000, 0x00000000, 0x00000000,
        0x40a04001, 0x00000000, 0x00000000, 0x00000000
      ]));
  test.deepEqual(salsa20.columnround(new Uint32Array([
        0x08521bd6, 0x1fe88837, 0xbb2aa576, 0x3aa26365,
        0xc54c6a5b, 0x2fc74c2f, 0x6dd39cc3, 0xda0a64f6,
        0x90a2f23d, 0x067f95a6, 0x06b35f61, 0x41e4732e,
        0xe859c100, 0xea4d84b7, 0x0f619bff, 0xbc6e965a
      ])), new Uint32Array([
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
  const salsa20 = require('./../src/salsa20.js');
  test.deepEqual(salsa20.doubleround(new Uint32Array([
        0x00000001, 0x00000000, 0x00000000, 0x00000000,
        0x00000000, 0x00000000, 0x00000000, 0x00000000,
        0x00000000, 0x00000000, 0x00000000, 0x00000000,
        0x00000000, 0x00000000, 0x00000000, 0x00000000
      ])), new Uint32Array([
        0x8186a22d, 0x0040a284, 0x82479210, 0x06929051,
        0x08000090, 0x02402200, 0x00004000, 0x00800000,
        0x00010200, 0x20400000, 0x08008104, 0x00000000,
        0x20500000, 0xa0000040, 0x0008180a, 0x612a8020
      ]));
  test.deepEqual(salsa20.doubleround(new Uint32Array([
        0xde501066, 0x6f9eb8f7, 0xe4fbbd9b, 0x454e3f57,
        0xb75540d3, 0x43e93a4c, 0x3a6f2aa0, 0x726d6b36,
        0x9243f484, 0x9145d1e8, 0x4fa9d247, 0xdc8dee11,
        0x054bf545, 0x254dd653, 0xd9421b6d, 0x67b276c1
      ])), new Uint32Array([
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
  const salsa20 = require('./../src/salsa20.js');
  test.equal(salsa20.littleendian(0,0,0,0), 0x00000000);
  test.equal(salsa20.littleendian(86,75,30,9), 0x091e4b56);
  test.equal(salsa20.littleendian(255,255,255,250), 0xfaffffff);
  test.deepEqual(salsa20.littleendian_rev(0x00000000), (new Uint8Array([0,0,0,0])));
  test.deepEqual(salsa20.littleendian_rev(0x091e4b56), (new Uint8Array([86,75,30,9])));
  test.deepEqual(salsa20.littleendian_rev(0xfaffffff), (new Uint8Array([255,255,255,250])));
  test.done();
};

exports.salsa20 = function(test) {
  'use strict';
  test.expect(3);
  const salsa20 = require('./../src/salsa20.js');
  test.deepEqual(salsa20.salsa20(
        new Uint32Array([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0])), new Uint32Array([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]));
  test.deepEqual(salsa20.salsa20(
        new Uint32Array([
        salsa20.littleendian(211,159,13,115), salsa20.littleendian(76,55,82,183), salsa20.littleendian(3,117,222,37), salsa20.littleendian(191,187,234,136),
        salsa20.littleendian(49,237,179,48), salsa20.littleendian(1,106,178,219), salsa20.littleendian(175,199,166,48), salsa20.littleendian(86,16,179,207),
        salsa20.littleendian(31,240,32,63), salsa20.littleendian(15,83,93,161), salsa20.littleendian(116,147,48,113), salsa20.littleendian(238,55,204,36),
        salsa20.littleendian(79,201,235,79), salsa20.littleendian(3,81,156,47), salsa20.littleendian(203,26,244,243), salsa20.littleendian(88,118,104,54)])),
        new Uint32Array([
        salsa20.littleendian(109,42,178,168), salsa20.littleendian(156,240,248,238), salsa20.littleendian(168,196,190,203), salsa20.littleendian(26,110,170,154),
        salsa20.littleendian(29,29,150,26), salsa20.littleendian(150,30,235,249), salsa20.littleendian(190,163,251,48), salsa20.littleendian(69,144,51,57),
        salsa20.littleendian(118,40,152,157), salsa20.littleendian(180,57,27,94), salsa20.littleendian(107,42,236,35), salsa20.littleendian(27,111,114,114),
        salsa20.littleendian(219,236,232,135), salsa20.littleendian(111,155,110,18), salsa20.littleendian(24,232,95,158), salsa20.littleendian(179,19,48,202)
        ]));
  test.deepEqual(salsa20.salsa20(
        new Uint32Array([
        salsa20.littleendian(88,118,104,54), salsa20.littleendian(79,201,235,79), salsa20.littleendian(3,81,156,47), salsa20.littleendian(203,26,244,243),
        salsa20.littleendian(191,187,234,136), salsa20.littleendian(211,159,13,115), salsa20.littleendian(76,55,82,183), salsa20.littleendian(3,117,222,37),
        salsa20.littleendian(86,16,179,207), salsa20.littleendian(49,237,179,48), salsa20.littleendian(1,106,178,219), salsa20.littleendian(175,199,166,48),
        salsa20.littleendian(238,55,204,36), salsa20.littleendian(31,240,32,63), salsa20.littleendian(15,83,93,161), salsa20.littleendian(116,147,48,113)])),
        new Uint32Array([
        salsa20.littleendian(179,19,48,202), salsa20.littleendian(219,236,232,135), salsa20.littleendian(111,155,110,18), salsa20.littleendian(24,232,95,158),
        salsa20.littleendian(26,110,170,154), salsa20.littleendian(109,42,178,168), salsa20.littleendian(156,240,248,238), salsa20.littleendian(168,196,190,203),
        salsa20.littleendian(69,144,51,57), salsa20.littleendian(29,29,150,26), salsa20.littleendian(150,30,235,249), salsa20.littleendian(190,163,251,48),
        salsa20.littleendian(27,111,114,114), salsa20.littleendian(118,40,152,157), salsa20.littleendian(180,57,27,94), salsa20.littleendian(107,42,236,35)
        ]));
  test.done();
};

exports.salsa20_k32 = function(test) {
  'use strict';
  test.expect(1);
  const salsa20 = require('./../src/salsa20.js');
  test.deepEqual(salsa20.salsa20_k32(
          new Uint32Array([
            salsa20.littleendian(1,2,3,4), salsa20.littleendian(5,6,7,8), salsa20.littleendian(9,10,11,12), salsa20.littleendian(13,14,15,16),
            salsa20.littleendian(201,202,203,204), salsa20.littleendian(205,206,207,208), salsa20.littleendian(209,210,211,212), salsa20.littleendian(213,214,215,216)
          ]),
          new Uint32Array([
            salsa20.littleendian(101,102,103,104), salsa20.littleendian(105,106,107,108), salsa20.littleendian(109,110,111,112), salsa20.littleendian(113,114,115,116)
          ])),
        new Uint32Array([
        salsa20.littleendian(69,37,68,39), salsa20.littleendian(41,15,107,193), salsa20.littleendian(255,139,122,6), salsa20.littleendian(170,233,217,98),
        salsa20.littleendian(89,144,182,106), salsa20.littleendian(21,51,200,65), salsa20.littleendian(239,49,222,34), salsa20.littleendian(215,114,40,126),
        salsa20.littleendian(104,197,7,225), salsa20.littleendian(197,153,31,2), salsa20.littleendian(102,78,76,176), salsa20.littleendian(84,245,246,184),
        salsa20.littleendian(177,160,133,130), salsa20.littleendian(6,72,149,119), salsa20.littleendian(192,195,132,236), salsa20.littleendian(234,103,246,74)
        ])
      );
  test.done();
};

exports.code = function(test) {
  'use strict';
  test.expect(2);
  const salsa20 = require('./../src/salsa20.js');
  const crypto = require('crypto');
  const key = crypto.randomBytes(32);
  const nonce = crypto.randomBytes(8);
  const text = crypto.randomBytes(1024);
  const encrypted = salsa20.code(key, nonce, text);
  const decrypted = salsa20.code(key, nonce, encrypted);
  test.notDeepEqual(encrypted, decrypted);
  test.deepEqual(decrypted, text);
  test.done();
};