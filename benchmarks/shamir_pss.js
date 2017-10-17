shamir = function(shares, quorum, text) {
  'use strict';
  const t = require('./../dist/test.js');
  const shamir = new t.shamir_pss.Configuration(shares, quorum);
  const encoded = shamir.encode(text);
  return shamir.decode(encoded);
};

randomText = function(length) {
  'use strict';
  const crypto = require('crypto');
  return crypto.randomBytes(length);
};

module.exports = {
  name: 'Shamir PSS (Encode + Decode)',
  tests: [
    {
      name: 'n= 6; k=4; l=      100 bytes',
      setup: function() {const text = randomText(100);},
      fn: function() {return shamir(6, 4, text);}
    },
    {
      name: 'n=10; k=6; l=      100 bytes',
      setup: function() {const text = randomText(100);},
      fn: function() {return shamir(10, 6, text);}
    },
    {
      name: 'n= 6; k=4; l=    1.000 bytes',
      setup: function() {const text = randomText(1000);},
      fn: function() {return shamir(6, 4, text);}
    },
    {
      name: 'n=10; k=6; l=    1.000 bytes',
      setup: function() {const text = randomText(1000);},
      fn: function() {return shamir(10, 6, text);}
    },
    {
      name: 'n= 6; k=4; l=   10.000 bytes',
      setup: function() {const text = randomText(10000);},
      fn: function() {return shamir(6, 4, text);}
    },
    {
      name: 'n=10; k=6; l=   10.000 bytes',
      setup: function() {const text = randomText(10000);},
      fn: function() {return shamir(10, 6, text);}
    },
    {
      name: 'n= 6; k=4; l=  100.000 bytes',
      setup: function() {const text = randomText(100000);},
      fn: function() {return shamir(6, 4, text);}
    },
    {
      name: 'n=10; k=6; l=  100.000 bytes',
      setup: function() {const text = randomText(100000);},
      fn: function() {return shamir(10, 6, text);}
    },
    {
      name: 'n= 6; k=4; l=1.000.000 bytes',
      setup: function() {const text = randomText(1000000);},
      fn: function() {return shamir(6, 4, text);}
    },
    {
      name: 'n=10; k=6; l=1.000.000 bytes',
      setup: function() {const text = randomText(1000000);},
      fn: function() {return shamir(10, 6, text);}
    },
    {
      name: '(4/3):    4KB',
      setup: function() {const text = randomText(4096);},
      fn: function() {return shamir(4, 3, text);}
    },
    {
      name: '(4/3):  128KB',
      setup: function() {const text = randomText(131072);},
      fn: function() {return shamir(4, 3, text);}
    },
    {
      name: '(4/3):  512KB',
      setup: function() {const text = randomText(524288);},
      fn: function() {return shamir(4, 3, text);}
    },
    {
      name: '(4/3): 4096KB',
      setup: function() {const text = randomText(4194304);},
      fn: function() {return shamir(4, 3, text);}
    }
  ]
};
