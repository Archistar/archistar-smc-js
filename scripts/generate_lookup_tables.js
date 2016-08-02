var logtable = new Int16Array(256);
var alogtable = new Int16Array(1025);
var genpoly = 0x11D;

logtable[0] = 512;
alogtable[0] = 1;

for (var i = 1; i < 255; i++) {
  var next = (alogtable[i-1])*2;
  if (next >= 256) {next = next ^ genpoly};

  alogtable[i] = next;
  logtable[alogtable[i]] = i;
}

alogtable[255] = alogtable[0];
logtable[alogtable[255]] = 255;

for (var i = 256; i < 510; i++) {
  alogtable[i] = alogtable[i % 255];
}

alogtable[510] = 1;

for (var i = 511; i < 1020; i++) {
  alogtable[i] = 0;
}

[logtable, alogtable]
