share = function() {
  const shares = Number.parseInt(document.getElementById(1).value);
  const quorum = Number.parseInt(document.getElementById(2).value);

  if (quorum >= shares) {alert("number shares must be greater than quorum for reconstruction"); return;}

  const input = document.getElementById(0);
  const text = require('./../src/text.js');
  const krawczyk_css = require('./../src/krawczyk_css.js');
  const krawczyk = new krawczyk_css.Configuration(shares, quorum);
  const encoded = krawczyk.encode(text.string_to_byte_array(input.value));

  const paragraph = document.getElementById(3);
  while (paragraph.firstChild) {
    paragraph.removeChild(paragraph.firstChild);
  }

  for (let i = 0; i < encoded.length; i++) {
    const p = document.createElement("p");
    const data = document.createTextNode(encoded[i].data);
    const keynonce = document.createTextNode(encoded[i].key_nonce_data.data);
    const degree = document.createTextNode(encoded[i].key_nonce_data.degree);
    const b = document.createElement("input");
    b.type = "checkbox";
    p.appendChild(b);
    p.appendChild(data);
    p.appendChild(keynonce);
    p.appendChild(degree);
    paragraph.appendChild(p);
  }

};

recombine = function() {
  const par = document.getElementById(3);
  const list = [];

  const shares = new Number(document.getElementById(1).value);
  const quorum = new Number(document.getElementById(2).value);

  for (let i = 0; i < shares; i++) {
    if (par.children[i].childNodes[0].checked) {
      list.push(par.children[i].childNodes[1]);
    }
  }

  if (list.length < quorum) {
    alert("not enough shares selected");
    return;
  }

  const krawczyk_css = require('./../src/krawczyk_css.js');
  const krawczyk = new krawczyk_css.Configuration(shares, quorum);

};
