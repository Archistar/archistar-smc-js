randomKey = function() {
  'use strict';
  const crypto = require('crypto');
  return crypto.randomBytes(32);
};

randomNonce = function() {
  'use strict';
  const crypto = require('crypto');
  return crypto.randomBytes(8);
};

randomText = function(length) {
  'use strict';
  const crypto = require('crypto');
  return crypto.randomBytes(length);
};

t = require('./../dist/test.js');

module.exports = {
  name: 'Salsa20 Tests',
  tests: [
    {
      name: '>    4KB noasm',
      setup: function() {const key = randomKey(); const nonce = randomNonce(); const text = randomText(4096);},
      fn: function() {return t.salsa20_noasm.code(key, nonce, text);}
    },
    {
      name: '>    4KB   asm',
      setup: function() {const key = randomKey(); const nonce = randomNonce(); const text = randomText(4096);},
      fn: function() {return t.salsa20.code(key, nonce, text);}
    },
    {
      name: '>  128KB noasm',
      setup: function() {const key = randomKey(); const nonce = randomNonce(); const text = randomText(131072);},
      fn: function() {return t.salsa20_noasm.code(key, nonce, text);}
    },
    {
      name: '>  128KB   asm',
      setup: function() {const key = randomKey(); const nonce = randomNonce(); const text = randomText(131072);},
      fn: function() {return t.salsa20.code(key, nonce, text);}
    },
    {
      name: '>  512KB noasm',
      setup: function() {const key = randomKey(); const nonce = randomNonce(); const text = randomText(524288);},
      fn: function() {return t.salsa20_noasm.code(key, nonce, text);}
    },
    {
      name: '>  512KB   asm',
      setup: function() {const key = randomKey(); const nonce = randomNonce(); const text = randomText(524288);},
      fn: function() {return t.salsa20.code(key, nonce, text);}
    },
    {
      name: '> 4096KB noasm',
      setup: function() {const key = randomKey(); const nonce = randomNonce(); const text = randomText(4194304);},
      fn: function() {return t.salsa20_noasm.code(key, nonce, text);}
    },
    {
      name: '> 4096KB   asm',
      setup: function() {const key = randomKey(); const nonce = randomNonce(); const text = randomText(4194304);},
      fn: function() {return t.salsa20.code(key, nonce, text);}
    }
  ]
};
