exports.test = function(test) {
  'use strict';
  test.expect(1);
  const text = require('./../src/text.js');
  const str = text.string_to_byte_array("Write something here ÖÄÜß€");
  test.deepEqual(str, new Uint8Array([0, 87, 0, 114, 0, 105, 0, 116, 0, 101, 0, 32, 0, 115, 0, 111, 0, 109, 0, 101, 0, 116, 0, 104, 0, 105, 0, 110, 0, 103, 0, 32, 0, 104, 0, 101, 0, 114, 0, 101, 0, 32, 0, 214, 0, 196, 0, 220, 0, 223, 32, 172]));
  test.done();
};

exports.roundtrip1 = function(test) {
  'use strict';
  test.expect(1);
  const text = require('./../src/text.js');
  const str = "This is just a test »ÖÄßł€¿«";
  const arr = text.string_to_byte_array(str);
  test.deepEqual(str, text.byte_array_to_string(arr));
  test.done();
};
