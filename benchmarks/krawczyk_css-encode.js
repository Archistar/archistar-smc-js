const krawczyk = function(shares, quorum, length) {
  'use strict';
  const krawczyk_css = require('./../src/krawczyk_css.js');
  const crypto = require('crypto');
  const krawczyk = new krawczyk_css.Configuration(shares, quorum);
  const text = crypto.randomBytes(length);
  return krawczyk.encode(text);
};

module.exports = {
  name: 'Krawczyk CSS (Encode only)',
  tests: [
    {
      name: 'n= 6; k=4; l=      100 bytes',
      fn: function() {return krawczyk(6, 4, 100);}
    },
    {
      name: 'n=10; k=6; l=      100 bytes',
      fn: function() {return krawczyk(10, 6, 100);}
    },
    {
      name: 'n= 6; k=4; l=    1.000 bytes',
      fn: function() {return krawczyk(6, 4, 1000);}
    },
    {
      name: 'n=10; k=6; l=    1.000 bytes',
      fn: function() {return krawczyk(10, 6, 1000);}
    },
    {
      name: 'n= 6; k=4; l=   10.000 bytes',
      fn: function() {return krawczyk(6, 4, 10000);}
    },
    {
      name: 'n=10; k=6; l=   10.000 bytes',
      fn: function() {return krawczyk(10, 6, 10000);}
    },
    {
      name: 'n= 6; k=4; l=  100.000 bytes',
      fn: function() {return krawczyk(6, 4, 100000);}
    },
    {
      name: 'n=10; k=6; l=  100.000 bytes',
      fn: function() {return krawczyk(10, 6, 100000);}
    },
    {
      name: 'n= 6; k=4; l=1.000.000 bytes',
      fn: function() {return krawczyk(6, 4, 1000000);}
    },
    {
      name: 'n=10; k=6; l=1.000.000 bytes',
      fn: function() {return krawczyk(10, 6, 1000000);}
    }
  ]
};
