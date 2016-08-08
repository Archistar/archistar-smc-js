/*
imitates the functionality of window.crypto.getRandomValues(), but always returns the same values for testing purposes
*/

var fake_rng = fake_rng || {};

fake_rng.get_values = function(a) {
  for (var i = 0; i < a.length; i++) {
    a[i] = fake_rng.source[i];
  }
};

fake_rng.source = new Uint8Array([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
//fake_rng.source = new Uint8Array([14,248,105,92,41,81,81,18,211,51,30,225,159,144,254,52,130,122,191,39,83,150,67,26,41,50,143,119,34,217,244,208,38,255,51,119,188,140,34,57,104,190,166,110,115,60,98,30,113,51,94,243,81,15,12,30,103,65,128,142,100,29,181,73,148,227,188,157,60,201,239,227,137,184,197,216,25,85,122,182,149,87,12,91,115,72,79,30,129,199,148,133,58,254,63,106,84,201,92,186]);
