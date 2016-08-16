const krawczyk = function(shares, quorum, length) {
  'use strict';
  const krawczyk_css = require('./../src/krawczyk_css.js');
  const crypto = require('crypto');
  const krawczyk = new krawczyk_css.Configuration(shares, quorum);
  const text = crypto.randomBytes(length);
  return krawczyk.encode(text);
}

module.exports = {
  name: 'Krawczyk CSS Tests',
  tests: [
    {
      name: 'n = 10; k = 6; l = 4096',
      fn: function() {return krawczyk(10, 6, 4096);}
    },
    {
      name: 'n = 10; k = 6; l = 100000',
      fn: function() {return krawczyk(10, 6, 100000);}
    }
  ]
};