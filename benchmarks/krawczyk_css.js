krawczyk = function(shares, quorum, text) {
  'use strict';
  const krawczyk_css = require('./../src/krawczyk_css.js');
  const crypto = require('crypto');
  const krawczyk = new krawczyk_css.Configuration(shares, quorum);
  const encoded = krawczyk.encode(text);
  return krawczyk.decode(encoded);
};

randomText = function(length) {
  'use strict';
  const crypto = require('crypto');
  return crypto.randomBytes(length);
};

module.exports = {
  name: 'Krawczyk CSS (Encode + Decode)',
  tests: [
    {
      name: 'n= 6; k=4; l=      100 bytes',
      setup: function() {const text = randomText(100);},
      fn: function() {return krawczyk(6, 4, text);}
    },
    {
      name: 'n=10; k=6; l=      100 bytes',
      setup: function() {const text = randomText(100);},
      fn: function() {return krawczyk(10, 6, text);}
    },
    {
      name: 'n= 6; k=4; l=    1.000 bytes',
      setup: function() {const text = randomText(1000);},
      fn: function() {return krawczyk(6, 4, text);}
    },
    {
      name: 'n=10; k=6; l=    1.000 bytes',
      setup: function() {const text = randomText(1000);},
      fn: function() {return krawczyk(10, 6, text);}
    },
    {
      name: 'n= 6; k=4; l=   10.000 bytes',
      setup: function() {const text = randomText(10000);},
      fn: function() {return krawczyk(6, 4, text);}
    },
    {
      name: 'n=10; k=6; l=   10.000 bytes',
      setup: function() {const text = randomText(10000);},
      fn: function() {return krawczyk(10, 6, text);}
    },
    {
      name: 'n= 6; k=4; l=  100.000 bytes',
      setup: function() {const text = randomText(100000);},
      fn: function() {return krawczyk(6, 4, text);}
    },
    {
      name: 'n=10; k=6; l=  100.000 bytes',
      setup: function() {const text = randomText(100000);},
      fn: function() {return krawczyk(10, 6, text);}
    },
    {
      name: 'n= 6; k=4; l=1.000.000 bytes',
      setup: function() {const text = randomText(1000000);},
      fn: function() {return krawczyk(6, 4, text);}
    },
    {
      name: 'n=10; k=6; l=1.000.000 bytes',
      setup: function() {const text = randomText(1000000);},
      fn: function() {return krawczyk(10, 6, text);}
    }
  ]
};
