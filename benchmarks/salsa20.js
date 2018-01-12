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
      name: 'Salsa20_noasm  |     4KB',
      setup: function() {const key = randomKey(); const nonce = randomNonce(); const text = randomText(4096);},
      fn: function() {return t.salsa20_noasm.code(key, nonce, text);}
    },
    {
      name: 'Salsa20_asm    |     4KB',
      setup: function() {const key = randomKey(); const nonce = randomNonce(); const text = randomText(4096);},
      fn: function() {return t.salsa20.code(key, nonce, text);}
    },
    {
      name: 'Salsa20_noasm  |   128KB',
      setup: function() {const key = randomKey(); const nonce = randomNonce(); const text = randomText(131072);},
      fn: function() {return t.salsa20_noasm.code(key, nonce, text);}
    },
    {
      name: 'Salsa20_asm    |   128KB',
      setup: function() {const key = randomKey(); const nonce = randomNonce(); const text = randomText(131072);},
      fn: function() {return t.salsa20.code(key, nonce, text);}
    },
    {
      name: 'Salsa20_noasm  |   512KB',
      setup: function() {const key = randomKey(); const nonce = randomNonce(); const text = randomText(524288);},
      fn: function() {return t.salsa20_noasm.code(key, nonce, text);}
    },
    {
      name: 'Salsa20_asm    |   512KB',
      setup: function() {const key = randomKey(); const nonce = randomNonce(); const text = randomText(524288);},
      fn: function() {return t.salsa20.code(key, nonce, text);}
    },
    {
      name: 'Salsa20_noasm  |  4096KB',
      setup: function() {const key = randomKey(); const nonce = randomNonce(); const text = randomText(4194304);},
      fn: function() {return t.salsa20_noasm.code(key, nonce, text);}
    },
    {
      name: 'Salsa20_asm    |  4096KB',
      setup: function() {const key = randomKey(); const nonce = randomNonce(); const text = randomText(4194304);},
      fn: function() {return t.salsa20.code(key, nonce, text);}
    }
  ]
};
