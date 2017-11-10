/*
this little script generates the logarithmic lookup tables for GF256;
it is a direct translation of the java version:
https://github.com/Archistar/archistar-smc/blob/master/src/main/java/at/archistar/crypto/math/gf256/GF256.java#L49

the idea is to use it as input for a template that generates a .js file
*/

let logtable = new Int16Array(256);
let alogtable = new Int16Array(1025);
let genpoly = 0x11D;

logtable[0] = 512;
alogtable[0] = 1;

for (let i = 1; i < 255; i++) {
  let next = (alogtable[i-1])*2;
  if (next >= 256) {next = next ^ genpoly;}

  alogtable[i] = next;
  logtable[alogtable[i]] = i;
}

alogtable[255] = alogtable[0];
logtable[alogtable[255]] = 255;

for (let i = 256; i < 510; i++) {
  alogtable[i] = alogtable[i % 255];
}

alogtable[510] = 1;

for (let i = 511; i < 1020; i++) {
  alogtable[i] = 0;
}

[logtable, alogtable];
