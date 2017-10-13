salsa20_enc = function(key, nonce, text) {
  'use strict';
  const t = require('./../dist/test.js');
  return t.salsa20.code(key, nonce, text);
};

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

module.exports = {
  name: 'Salsa20 Tests',
  tests: [
    {
      name: 'Salsa20 with       100 bytes',
      setup: function() {const key = randomKey(); const nonce = randomNonce(); const text = randomText(100);},
      fn: function() {return salsa20_enc(key, nonce, text);}
    },
    {
      name: 'Salsa20 with     1.000 bytes',
      setup: function() {const key = randomKey(); const nonce = randomNonce(); const text = randomText(1000);},
      fn: function() {return salsa20_enc(key, nonce, text);}
    },
    {
      name: 'Salsa20 with    10.000 bytes',
      setup: function() {const key = randomKey(); const nonce = randomNonce(); const text = randomText(10000);},
      fn: function() {return salsa20_enc(key, nonce, text);}
    },
    {
      name: 'Salsa20 with   100.000 bytes',
      setup: function() {const key = randomKey(); const nonce = randomNonce(); const text = randomText(100000);},
      fn: function() {return salsa20_enc(key, nonce, text);}
    },
    {
      name: 'Salsa20 with 1.000.000 bytes',
      setup: function() {const key = randomKey(); const nonce = randomNonce(); const text = randomText(1000000);},
      fn: function() {return salsa20_enc(key, nonce, text);}
    }
  ]
};
