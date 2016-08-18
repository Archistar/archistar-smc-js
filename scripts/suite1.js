randomText = function (length) {
  'use strict';
  const res = new Uint8Array(length);
  if (length < 65536) {
    window.crypto.getRandomValues(res);
  } else {
    const temp = new Uint8Array(65536);
    let i = 0;
    while (i < length) {
      res.set(temp, i * 65536);
      i = i + 65536;
    }
  }
  return res;
};

randomKey = function () {
  'use strict';
  const res = new Uint8Array(32);
  window.crypto.getRandomValues(res);
  return res;
};

randomNonce = function () {
  'use strict';
  const res = new Uint8Array(8);
  window.crypto.getRandomValues(res);
  return res;
};

fn1 = function(key, nonce, text) {
  'use strict';
  const salsa20 = require('./../src/salsa20.js');
  return salsa20.code(key, nonce, text);
};

fn2 = function(length) {
  'use strict';
  const key = new Uint8Array(32);
  window.crypto.getRandomValues(key);
  const nonce = new Uint8Array(8);
  window.crypto.getRandomValues(nonce);
  const text = new Uint8Array(length);
  window.crypto.getRandomValues(text);
  return salsa20.code(key, nonce, text);
};
