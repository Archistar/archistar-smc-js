// the default (and persistent) heap
const default_heap_size = 1048576;
const default_heap = new ArrayBuffer(default_heap_size);
// "allocate" an asm.js heap of legal size
// or return the persistent default heap to make the garbage collector's life easier
// legal heap size according to http://asmjs.org/spec/latest/#linking-0 is currently:
// 2^n for n in [12, 24) or 2^24 * n for n ≥ 1
export function allocate(desired) {
  'use strict';
  let log = Math.log2(desired);
  if (desired < default_heap_size) {
    return default_heap;
  } else if (log < 12) {
    return new ArrayBuffer(4096);
  } else if (log >= 24) {
    return new ArrayBuffer(Math.ceil(desired / 16777216) * 16777216);
  } else {
    return new ArrayBuffer(Math.pow(2, Math.ceil(log)));
  }
}
