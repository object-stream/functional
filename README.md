# object-stream/functional [![NPM version][npm-img]][npm-url]

[npm-img]: https://img.shields.io/npm/v/@object-stream/functional.svg
[npm-url]: https://npmjs.org/package/@object-stream/functional

`@object-stream/functional` creates a chain out of regular functions, asynchronous functions, generator functions
and asynchronous generator functions. The resulting chain is represented as an asynchronous function or
an asynchronous generator function. It eliminates a boilerplate helping to concentrate on functionality without losing the performance
especially making it easy to build asynchronous object processing pipelines using modern JavaScript as a complement/alternative to streams.

`@object-stream/functional` is a lightweight, no-dependencies micro-package. It is distributed under New BSD license.

## Intro

```js
const gen = require('@object-stream/functional');
const fun = require('@object-stream/functional/fun');

// trivial pipe for processing numbers
const pipe1 = gen(x => x * x, x => x + 1);

(async () => {
  for (let value of [1, 2, 3]) {
    for await (let result of pipe1(value)) {
      console.log(result);
    }
  }
})();
// 2, 5, 10


// the same with asynchronous functions
const pipe2 = fun.asArray(x => x * x, x => x + 1);

(async () => {
  for (let value of [1, 2, 3]) {
    for (let result of await pipe2(value)) {
      console.log(result);
    }
  }
})();
// 2, 5, 10

// using async and generators
const pipe3 = gen(
  async id => await getRecord(id),
  record => record.parentId,
  async function* (parentId) {
    const children = await getChildren(parentId);
    for (let child of children) {
      yield getRecord(child.id);
    }
  },
  async record => await writeToFile(record)
);

const fs = require('fs');

// truly asynchronous file processing
const pipe4 = gen(
  fs.createReadStream('streams.js'),
  b => b.toString().replace(/a/g, 'o'),
  s => s.replace(/m/g, 'w')
);

(async () => {
  for await (let buf of pipe4()) {
    // write results to stdout
    fs.writeSync(1, buf);
  }
})();

const {none, finalValue} = gen;

// pipe to filter odd values
const pipe5 = gen(x => x * x, x => x + 1, x % 2 ? none : x);
// 1, 2, 3 => 2, 10

// pipe to shortcut calculations
const pipe6 = fun(x => x * x, x % 2 ? finalValue(x) : x, x => x + 1);
// 1, 2, 3 => 1, 5, 9

// pipe to include a source
const pipe7 = gen([1, 2, 3], x => x * x, x => x + 1);

(async () => {
  for await (let result of pipe7()) {
    console.log(result);
  }
})();
// 2, 5, 10
```

`fun()` works on Node starting with version 8, `gen()` &mdash; 10.

## Installation

```bash
npm i --save @object-stream/functional
# or: yarn add @object-stream/functional
```

## Documentation

The exhaustive documentation can be found in [Wiki](https://github.com/object-stream/functional/wiki).

## Release History

- 1.2.0 *Added `stop` and the documentation.*
- 1.1.0 *Added popular utilities: fold, scan, skip and take.*
- 1.0.1 *Technical release.*
- 1.0.0 *The initial release.*
