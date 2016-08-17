const salsa20_enc = function(length) {
  'use strict';
  const salsa20 = require('./../src/salsa20.js');
  const crypto = require('crypto');
  const key = crypto.randomBytes(32);
  const nonce = crypto.randomBytes(8);
  const text = crypto.randomBytes(length);
  return salsa20.code(key, nonce, text);
};

module.exports = {
  name: 'Salsa20 Tests',
  tests: [
    {
      name: 'Salsa20 with       100 bytes',
      fn: function() {return salsa20_enc(100);}
    },
    {
      name: 'Salsa20 with     1.000 bytes',
      fn: function() {return salsa20_enc(1000);}
    },
    {
      name: 'Salsa20 with    10.000 bytes',
      fn: function() {return salsa20_enc(10000);}
    },
    {
      name: 'Salsa20 with   100.000 bytes',
      fn: function() {return salsa20_enc(100000);}
    },
    {
      name: 'Salsa20 with 1.000.000 bytes',
      fn: function() {return salsa20_enc(1000000);}
    }
  ]
};
