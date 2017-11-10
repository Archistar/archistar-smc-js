setup = function(shares, quorum) {
    'use strict';
    return new (require('./../dist/test.js')).shamir_pss.Configuration(shares, quorum);
  };
  
  randomText = function(length) {
    'use strict';
    const crypto = require('crypto');
    return crypto.randomBytes(length);
  };
  
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
  