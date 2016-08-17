/*
just helpers to convert javascript strings to byte arrays and back
*/

const text = module.exports;

text.string_to_byte_array = function (s) {
  'use strict';
  const length = s.length;
  const res = new Uint8Array(length*2);
  for (let i = 0; i < length; i++) {
    const c = text.to_bytes(s.codePointAt(i));
    res[i*2] = c[0];
    res[(i*2)+1] = c[1];
  }
  return res;
};

text.byte_array_to_string = function (a) {
  'use strict';
  const length = a.length / 2;
  const u16 = new Uint16Array(length);
  for (let i = 0; i < length; i++) {
    const c = text.of_bytes([a[i*2],a[(i*2)+1]]);
    u16[i] = c;
  }
  // String.fromCharCode does not take an Array as argument
  // but rather multiple arguments, therefore the "apply" magic
  return String.fromCharCode.apply(null, u16);
};

text.to_bytes = function (c) {
  'use strict';
  return [c >>> 8, c & 255];
};

text.of_bytes = function (a) {
  'use strict';
  return a[0] << 8 ^ a[1];
};
