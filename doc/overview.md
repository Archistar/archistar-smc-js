# Developing a Secret Sharing Library in JavaScript

This is a short overview of the development history and current status of the **archistarJS** secret sharing library.

## What we had already

Development started from a blank slate, but with the **archistar-smc** (written in Java) already in place. Most of the new JavaScript code could easily adapted be from the existing Java code.

## Initial results

Performance, however, was disappointing:

| `(4/3)`  | Encode    | Decode    |
| -------- | --------- | --------- |
| Shamir   | XXXX kB/s | XXXX kB/s |
| Krawczyk | XXXX kB/s | XXXX kB/s |
| Rabin    | XXXX kB/s | XXXX kB/s |

Optimizations that have yielded *major* performance improvements in the Java version, have had almost no impact in JavaScript.

For comparison, these are the numbers for the Java version on the same machine:

| `(4/3)`  | Encode    | Decode    |
| -------- | --------- | --------- |
| Shamir   | XXXX kB/s | XXXX kB/s |
| Krawczyk | XXXX kB/s | XXXX kB/s |
| Rabin    | XXXX kB/s | XXXX kB/s |

## asm.js

The usual method to achieve competitive performance on JavaScript platforms is **asm.js**. This means writing code in C/C++ and compiling it down to a very restricted subset of JavaScript that can be executed **very** efficiently by modern JavaScript VMs. It is claimed that with this approach, performance almost equal to native code can be achieved. We have found this to be true in our case.

```java
IntStream.range(0, n).parallel().forEach(
  x -> {
    int[] mul = mulTables[x];
    byte[] out = output[x];
    for (int i = k - 1; i < data.length; i += k) {
      int res = data[i] & 0xff;
      for (int y = 1; y < k; y++) {
        res = GF256.add(data[i - y] & 0xff, mul[res]);
      }
      out[i / k] = (byte) res;
    }
    if (data.length % k != 0) {
      int res = data[data.length - 1] & 0xff;
      for (int y = data.length - 2; y >= data.length - data.length % k; y--) {
        res = GF256.add(data[y] & 0xff, mul[res]);
      }
      out[data.length / k] = (byte) res;
    }
  }
);
```

```c
for (size_t x = 0; x < n; x++) {
  uint8_t * out = out_a[x];
  uint8_t * mult = multables[x];
  for (size_t i = k - 1; i < len; i += k) {
  	uint8_t res = in[i];
  for (size_t y = 1; y < k; y++) {
  	res = in[i - y] ^ mult[res];
  }
  out[i/k] = res;
  }
  if (len % k != 0) {
  	uint8_t res = in[len - 1];
  	for (size_t y = len - 2; y >= len - len % k; y--) {
  		res = in[y] ^ mult[res];
  	}
  	out[len/k] = res;
  }
}
```

## WebAssembly

## How to build

