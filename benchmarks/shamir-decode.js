randomText = function(length) {
  'use strict';
  const crypto = require('crypto');
  return crypto.randomBytes(length);
};

engine = new (require('./../dist/test.js')).shamir_pss.Configuration(4, 3);

module.exports = {
  name: 'Shamir (Decode)',
  tests: [
    {
      name: '(4/3):    4KB',
      setup: function() {const engine = setup(4,3); const text = engine.encode(randomText(4096));},
      fn: function() {return engine.decode(text);}
    },
    {
      name: '(4/3):  128KB',
      setup: function() {const engine = setup(4,3); const text = engine.encode(randomText(131072));},
      fn: function() {return engine.decode(text);}
    },
    {
      name: '(4/3):  512KB',
      setup: function() {const engine = setup(4,3); const text = engine.encode(randomText(524288));},
      fn: function() {return engine.decode(text);}
    },
    {
      name: '(4/3): 4096KB',
      setup: function() {const engine = setup(4,3); const text = engine.encode(randomText(4194304));},
      fn: function() {return engine.decode(text);}
    }
  ]
};
