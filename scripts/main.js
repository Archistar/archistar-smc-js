share = function() {
  const text = document.getElementById(0);
  alert(text.value);
  // convert string to Uint8Array
  const krawczyk_css = require('./../src/krawczyk_css.js');
  const krawczyk = new krawczyk_css.Configuration(10, 6);
  const encoded = krawczyk.encode(text.value);
  // convert Uint8Arrays to strings and show
};
