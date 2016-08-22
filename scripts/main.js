share = function() {
  const shares = parseInt(document.getElementById(1).value, 10);
  const quorum = parseInt(document.getElementById(2).value, 10);
  if (quorum >= shares) {alert("number shares must be greater than quorum for reconstruction"); return;}
  const webcrypto = document.getElementById(4).checked;

  const input = document.getElementById(0);
  const text = require('./../src/text.js');
  const krawczyk_css = require('./../src/krawczyk_css.js');
  const krawczyk = new krawczyk_css.Configuration(shares, quorum);
  const encoded = krawczyk.encode(text.string_to_byte_array(input.value));

  const paragraph = document.getElementById(3);
  while (paragraph.firstChild) {
    if (typeof(paragraph.firstChild.childNodes[1]) !== 'undefined') {
      sessionStorage.removeItem("share_data_" + paragraph.firstChild.childNodes[1].data);
      sessionStorage.removeItem("key_nonce_data_" + paragraph.firstChild.childNodes[1].data);
    }
    paragraph.removeChild(paragraph.firstChild);
  }

  for (let i = 0; i < encoded.length; i++) {
    const p = document.createElement("p");
    const degree = document.createTextNode(encoded[i].key_nonce_data.degree);
    const b = document.createElement("input");
    b.type = "checkbox";
    p.appendChild(b);
    sessionStorage.setItem("share_data_" + encoded[i].degree, JSON.stringify(encoded[i].data));
    sessionStorage.setItem("key_nonce_data_" + encoded[i].degree, JSON.stringify(encoded[i].key_nonce_data.data));
    p.appendChild(degree);
    paragraph.appendChild(p);
  }

  sessionStorage.setItem("original_length", encoded[0].original_length);
};

recombine = function() {
  const par = document.getElementById(3);
  if (typeof(par.children[0]) === 'undefined') {return;}
  const shares = parseInt(document.getElementById(1).value, 10);
  const quorum = parseInt(document.getElementById(2).value, 10);
  const shs = [];

  for (let i = 0; i < shares; i++) {
    if (par.children[i].childNodes[0].checked) {
      const degree = parseInt(par.children[i].childNodes[1].data, 10);
      const data = JSON.parse(sessionStorage.getItem("share_data_" + degree));
      const key_nonce_data = JSON.parse(sessionStorage.getItem("key_nonce_data_" + degree));
      const length = parseInt(sessionStorage.getItem("original_length"), 10);
      const key_nonce = {data: key_nonce_data, degree: degree, original_length: length};
      shs.push({data: data, degree: degree, key_nonce_data: key_nonce, original_length: length});
    }
  }

  if (shs.length < quorum) {
    alert("not enough shares selected");
    return;
  }

  const krawczyk_css = require('./../src/krawczyk_css.js');
  const krawczyk = new krawczyk_css.Configuration(shares, quorum);
  const text = require('./../src/text.js');
  const reconstructed = text.byte_array_to_string(krawczyk.decode(shs));
  alert(reconstructed);
};
