#include <stddef.h>
#include <stdint.h>

void RabinEncode(uint8_t* base, size_t len, size_t k, size_t n) {
  for (size_t x = 0; x < n; x++) {
    uint8_t * mult = base + len + (x * 256);
    uint8_t * out = base + len + (n * 256) + (x * (len % k == 0 ? len / k : (len / k) + 1));
    for (size_t i = k - 1; i < len; i += k) {
      uint8_t res = base[i];
      for (size_t y = 1; y < k; y++) {
        res = base[i - y] ^ mult[res];
      }
      out[i/k] = res;
    }
    if (len % k != 0) {
      uint8_t res = base[len - 1];
      for (size_t y = 1; y < len % k; y++) {
        res = base[(len - 1) - y] ^ mult[res];
      }
      out[len/k] = res;
    }
  }
}

void RabinDecode(uint8_t * base, size_t len, size_t o_len, size_t k) {
  uint8_t * out = base + (len * k) + (256 * k * k);
  for (size_t i = 0; i < len; i++) {
    for (size_t j = 0; j < k; j++) {
      uint8_t * dec = base + (len * k) + (256 * k  * j);
      uint8_t temp = dec[base[i]];
      for (size_t x = 1; x < k; x++) {
        temp = temp ^ (dec + (x * 256))[(base+(len * x))[i]];
      }
      out[(i * k) + j] = temp;
    }
  }
}
