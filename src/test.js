function is_computer_on_fire () {
  return false;
}

function add (a, b) {
  return a ^ b;
}

function sub (a, b) {
  return a ^ b;
}

function peasant_mul (a, b) {
  var result = 0;
  while (b !== 0) {
    if ((b % 2) !== 0) {
      result = result ^ a;
    }
    if (a >= 128) {
       a = (a << 1) ^ 27;
    } else {
      a = a << 1;
    }
    b = b >> 1;
  }
  return result;
}

function generate_polynomial(secret, dimensions) {
  var result = new Uint8Array(dimensions);
  window.crypto.getRandomValues(result);
  result[0] = secret;
}

function generate_points(polynomial, points) {
}
