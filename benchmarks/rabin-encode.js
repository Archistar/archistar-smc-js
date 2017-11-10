setup = function(shares, quorum) {
  'use strict';
  return new (require('./../dist/test.js')).rabin_ids.Configuration(shares, quorum);
};

randomText = function(length) {
  'use strict';
  const crypto = require('crypto');
  return crypto.randomBytes(length);
};

module.exports = {
  name: 'Rabin (Encode)',
  tests: [
    {
      name: '(4/3):    4KB',
      setup: function() {const text = randomText(4096); const engine = setup(4,3);},
      fn: function() {return engine.encode(text);}
    },
    {
      name: '(4/3):  128KB',
      setup: function() {const text = randomText(131072); const engine = setup(4,3);},
      fn: function() {return engine.encode(text);}
    },
    {
      name: '(4/3):  512KB',
      setup: function() {const text = randomText(524288); const engine = setup(4,3);},
      fn: function() {return engine.encode(text);}
    },
    {
      name: '(4/3): 4096KB',
      setup: function() {const text = randomText(4194304); const engine = setup(4,3);},
      fn: function() {return engine.encode(text);}
    }
  ]
};
