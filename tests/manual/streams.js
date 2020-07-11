'use strict';

const fs = require('fs');
const gen = require('../../gen');

const pipe = gen(
  fs.createReadStream(__filename, {encoding: 'utf8'}),
  s => s.replace(/a/g, 'o'),
  s => s.replace(/m/g, 'w')
);

(async () => {
  for await (const buf of pipe()) {
    fs.writeSync(1, buf);
  }
})();
