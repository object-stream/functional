'use strict';

const fs = require('fs');
const {promisify} = require('util');

const gen = require('../../gen');

const pipe = gen(
  fs.createReadStream(__filename, {encoding: 'utf8'}),
  s => s.replace(/a/g, 'o'),
  s => s.replace(/m/g, 'w')
);

(async () => {
  for await (let buf of pipe()) {
    await promisify(fs.writeSync)(1, buf);
  }
})();
