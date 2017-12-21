import * as gf256 from "./gf256.js";
import * as matrix from "./matrix.js";

/**
 * @constructor
 * @param {number} shares - the number of shares to construct (aka 'n')
 * @param {number} quorum - the number of shares necessary for reconstruction (aka 'k')
 */
export function Configuration (shares, quorum) {
  // multiplication tables for encoding
  const multable = new Uint8Array(shares * 256);
  for (let i = 0; i < shares; i++) {
    for (let j = 0; j < 256; j++) {
      multable[(i * 256) + j] = gf256.mult(i + 1, j);
    }
  }
  // the default (and persistent) heap
  const default_heap_size = 1048576;
  const default_heap = new ArrayBuffer(default_heap_size);
  // "allocate" a heap of legal size
  // or return the persistent default heap to make the garbage collector's life easier
  // legal heap size according to http://asmjs.org/spec/latest/#linking-0 is currently:
  // 2^n for n in [12, 24) or 2^24 * n for n ≥ 1
  function allocate_heap(desired) {
    'use strict';
    let log = Math.log2(desired);
    if (desired < default_heap_size) {
      return default_heap;
    } else if (log < 12) {
      return new ArrayBuffer(4096);
    } else if (log >= 24) {
      return new ArrayBuffer(Math.ceil(desired / 16777216) * 16777216);
    } else {
      return new ArrayBuffer(Math.pow(2, Math.ceil(log)));
    }
  }
  function encode(secret) {
    'use strict';

    // length of each share; length of multiplication table segment; base offset of secret-share data
    const new_len = Math.ceil(secret.length / quorum);
    const mult_len = 256 * shares;
    const out_base = secret.length + mult_len;

    // "allocate" asm.js heap and views to memory segments
    const asm_heap = allocate_heap(secret.length + mult_len + (new_len * shares));
    const input = new Uint8Array(asm_heap, 0, secret.length);
    const mult = new Uint8Array(asm_heap, secret.length, 256 * shares);

    // copy input and multiplication table onto heap
    input.set(secret);
    mult.set(multable);

    const asm0 = asm({ Math: Math, Int8Array: Int8Array }, {}, asm_heap);
    asm0._RabinEncode(0, secret.length, quorum, shares);

    // construct the output objects with secret-shared data copied out of the heap
    const res = new Array(shares);
    for (let x = 0; x < shares; x++) {
      let out = new Uint8Array(asm_heap, out_base + (new_len * x), new_len);
      res[x] = {
        data: out.slice(),
        degree: x + 1,
        original_length: secret.length
      };
    }

    return res;
  }
  function decode(shs) {
    'use strict';
    const xvalues = new Uint8Array(shs.length);
    for (let i = 0; i < shs.length; i++) {xvalues[i] = shs[i].degree;}
    const decoder = matrix.generate_decoder(quorum, xvalues);
    const original_length = shs[0].original_length;

    // length of shares; base offset of multiplication table segment; length of multiplication table segment; base offset of output data
    const length = shs[0].data.length;
    const mult_base = length * quorum;
    const mult_len = 256 * quorum * quorum;
    const out_base = mult_base + mult_len;

    // "allocate" asm.js heap and views to memory segments
    const asm_heap =allocate_heap(out_base + original_length);
    const input = new Uint8Array(asm_heap, 0, mult_base);
    const mult = new Uint8Array(asm_heap, mult_base, mult_len);
    const output = new Uint8Array(asm_heap, out_base, original_length);

    // copy the input data onto the heap
    for (let x = 0; x < quorum; x++) {
      input.set(shs[x].data, length * x);
    }

    // construct the multiplication tables and copy them onto the heap
    decoder.forEach((c, i, _) => c.forEach((m, j, _) => {
      let buf = new Uint8Array(asm_heap, mult_base + (i * quorum * 256) + (j * 256), 256);
      for (let x = 0; x < 256; x++) {
        buf[x] = gf256.mult(x, m);
      }
    }));

    const asm0 = asm({ Math: Math, Int8Array: Int8Array }, {}, asm_heap);
    asm0._RabinDecode(0, length, original_length, quorum);

    return output.slice();
  }
  // edited artifact compiled from "secret.c"
  function asm(global, env, buffer) {
  'use asm';

    var Math_imul = global.Math.imul;
    var HEAP8 = new global.Int8Array(buffer);

    function _RabinEncode($0,$1,$2,$3) {
      $0 = $0|0;
      $1 = $1|0;
      $2 = $2|0;
      $3 = $3|0;
      var $$060$lcssa = 0, $$06071 = 0, $$06166 = 0, $$062$lcssa = 0, $$06265 = 0, $$06367 = 0, $$06477 = 0, $$072 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $20 = 0, $21 = 0;
      var $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0;
      var $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $exitcond = 0, $exitcond82 = 0, $exitcond83 = 0, $not$ = 0;
      $4 = ($3|0)==(0);
      if ($4) {
       return;
      }
      $5 = (($0) + ($1)|0);
      $6 = $3 << 8;
      $7 = (($5) + ($6)|0);
      $8 = (($1>>>0) % ($2>>>0))&-1;
      $9 = (($1>>>0) / ($2>>>0))&-1;
      $not$ = ($8|0)!=(0);
      $10 = $not$&1;
      $11 = (($10) + ($9))|0;
      $12 = (($2) + -1)|0;
      $13 = ($12>>>0)<($1>>>0);
      $14 = ($8|0)==(0);
      $15 = (($1) + -1)|0;
      $16 = (($0) + ($15)|0);
      $17 = ($8>>>0)>(1);
      $18 = ($2>>>0)>(1);
      $$06477 = 0;
      while(1) {
       $19 = $$06477 << 8;
       $20 = (($5) + ($19)|0);
       $21 = Math_imul($11, $$06477)|0;
       $22 = (($7) + ($21)|0);
       if ($13) {
        $$06367 = $12;
        while(1) {
         $23 = (($0) + ($$06367)|0);
         $24 = HEAP8[$23>>0]|0;
         if ($18) {
          $$06166 = 1;$$06265 = $24;
          while(1) {
           $29 = (($$06367) - ($$06166))|0;
           $30 = (($0) + ($29)|0);
           $31 = HEAP8[$30>>0]|0;
           $32 = $$06265&255;
           $33 = (($20) + ($32)|0);
           $34 = HEAP8[$33>>0]|0;
           $35 = $34 ^ $31;
           $36 = (($$06166) + 1)|0;
           $exitcond = ($36|0)==($2|0);
           if ($exitcond) {
            $$062$lcssa = $35;
            break;
           } else {
            $$06166 = $36;$$06265 = $35;
           }
          }
         } else {
          $$062$lcssa = $24;
         }
         $25 = (($$06367>>>0) / ($2>>>0))&-1;
         $26 = (($22) + ($25)|0);
         HEAP8[$26>>0] = $$062$lcssa;
         $27 = (($$06367) + ($2))|0;
         $28 = ($27>>>0)<($1>>>0);
         if ($28) {
          $$06367 = $27;
         } else {
          break;
         }
        }
       }
       if (!($14)) {
        $37 = HEAP8[$16>>0]|0;
        if ($17) {
         $$06071 = $37;$$072 = 1;
         while(1) {
          $39 = (($15) - ($$072))|0;
          $40 = (($0) + ($39)|0);
          $41 = HEAP8[$40>>0]|0;
          $42 = $$06071&255;
          $43 = (($20) + ($42)|0);
          $44 = HEAP8[$43>>0]|0;
          $45 = $44 ^ $41;
          $46 = (($$072) + 1)|0;
          $exitcond82 = ($46|0)==($8|0);
          if ($exitcond82) {
           $$060$lcssa = $45;
           break;
          } else {
           $$06071 = $45;$$072 = $46;
          }
         }
        } else {
         $$060$lcssa = $37;
        }
        $38 = (($22) + ($9)|0);
        HEAP8[$38>>0] = $$060$lcssa;
       }
       $47 = (($$06477) + 1)|0;
       $exitcond83 = ($47|0)==($3|0);
       if ($exitcond83) {
        break;
       } else {
        $$06477 = $47;
       }
      }
      return;
     }

     function _RabinDecode($0,$1,$2,$3) {
       $0 = $0|0;
       $1 = $1|0;
       $2 = $2|0;
       $3 = $3|0;
       var $$042$lcssa = 0, $$04245 = 0, $$04350 = 0, $$04447 = 0, $$046 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0;
       var $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $exitcond = 0, $exitcond52 = 0, $exitcond53 = 0;
       $4 = Math_imul($3, $1)|0;
       $5 = (($0) + ($4)|0);
       $6 = $3 << 8;
       $7 = Math_imul($6, $3)|0;
       $8 = (($5) + ($7)|0);
       $9 = ($1|0)==(0);
       if ($9) {
        return;
       }
       $10 = ($3|0)==(0);
       $11 = ($3>>>0)>(1);
       $$04350 = 0;
       while(1) {
        if (!($10)) {
         $12 = (($0) + ($$04350)|0);
         $13 = Math_imul($$04350, $3)|0;
         $$04447 = 0;
         while(1) {
          $15 = Math_imul($$04447, $6)|0;
          $16 = (($5) + ($15)|0);
          $17 = HEAP8[$12>>0]|0;
          $18 = $17&255;
          $19 = (($16) + ($18)|0);
          $20 = HEAP8[$19>>0]|0;
          if ($11) {
           $$04245 = $20;$$046 = 1;
           while(1) {
            $24 = $$046 << 8;
            $25 = (($16) + ($24)|0);
            $26 = Math_imul($$046, $1)|0;
            $27 = (($0) + ($26)|0);
            $28 = (($27) + ($$04350)|0);
            $29 = HEAP8[$28>>0]|0;
            $30 = $29&255;
            $31 = (($25) + ($30)|0);
            $32 = HEAP8[$31>>0]|0;
            $33 = $32 ^ $$04245;
            $34 = (($$046) + 1)|0;
            $exitcond = ($34|0)==($3|0);
            if ($exitcond) {
             $$042$lcssa = $33;
             break;
            } else {
             $$04245 = $33;$$046 = $34;
            }
           }
          } else {
           $$042$lcssa = $20;
          }
          $21 = (($$04447) + ($13))|0;
          $22 = (($8) + ($21)|0);
          HEAP8[$22>>0] = $$042$lcssa;
          $23 = (($$04447) + 1)|0;
          $exitcond52 = ($23|0)==($3|0);
          if ($exitcond52) {
           break;
          } else {
           $$04447 = $23;
          }
         }
        }
        $14 = (($$04350) + 1)|0;
        $exitcond53 = ($14|0)==($1|0);
        if ($exitcond53) {
         break;
        } else {
         $$04350 = $14;
        }
       }
       return;
      }

    return {
      _RabinEncode: _RabinEncode,
      _RabinDecode: _RabinDecode
    };
  }
  this.encode = encode;
  this.decode = decode;
}
