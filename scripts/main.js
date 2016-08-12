share = function() {
  const input = document.getElementById(0);
  alert(input.value);
  const text = require('./../src/text.js');
  const krawczyk_css = require('./../src/krawczyk_css.js');
  const krawczyk = new krawczyk_css.Configuration(10, 6);
  const encoded = krawczyk.encode(text.string_to_byte_array(input.value));

  for (let i = 0; i < encoded.length; i++) {
    const heading = document.createElement("h3");
    const heading_text = document.createTextNode(encoded[i].data);
    heading.appendChild(heading_text);
    document.body.appendChild(heading);
  }

};
