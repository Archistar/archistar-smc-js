#include <stddef.h>
#include <stdint.h>

void Q(uint32_t* base32, size_t i0, size_t i1, size_t i2, size_t i3) {
  uint32_t temp;
  temp = base32[i0] + base32[i3];
  base32[i1] = base32[i1] ^ (temp << 7) ^ (temp >> 25);
  temp = base32[i1] + base32[i0];
  base32[i2] = base32[i2] ^ (temp << 9) ^ (temp >> 23);
  temp = base32[i2] + base32[i1];
  base32[i3] = base32[i3] ^ (temp << 13) ^ (temp >> 19);
  temp = base32[i3] + base32[i2];
  base32[i0] = base32[i0] ^ (temp << 18) ^ (temp >> 14);
}

void Salsa20(uint32_t* base32, uint8_t* base8, uint32_t blocks) {
  for (uint32_t block = 0; block < blocks; block++) {
    for (size_t i = 0; i < 16; i++) {
      base32[i + 16] = base32[i + 32];
    }
    base8[96] = block & 0xff;
    base8[97] = (block >> 8) & 0xff;
    base8[98] = (block >> 16) & 0xff;
    base8[99] = (block >> 24) & 0xff;
    for (size_t i = 0; i < 16; i++) {
      base32[i] = base32[i + 16];
    }
    for (size_t i = 0; i < 10; i++) {
      Q(base32, 0, 4, 8, 12);
      Q(base32, 5, 9, 13, 1);
      Q(base32, 10, 14, 2, 6);
      Q(base32, 15, 3, 7, 11);

      Q(base32, 0, 1, 2, 3);
      Q(base32, 5, 6, 7, 4);
      Q(base32, 10, 11, 8, 9);
      Q(base32, 15, 12, 13, 14);
    }
    for (size_t i = 0; i < 16; i++) {
      base32[i] += base32[i + 16];
      base32[((block + 3) * 16) + i] ^= base32[i];
    }
  }
}