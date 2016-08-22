exports.test = function(test) {
  'use strict';
  test.expect(1);
  const text = require('./../src/text.js');
  const str = text.string_to_byte_array("Write something here ÖÄÜß€");
  test.deepEqual(str, new Uint8Array([87, 114, 105]));
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
