'use strict';

const unit = require('heya-unit');
const {delay} = require('./helpers');
const {test} = require('./helpers-gen');
const gen = require('../gen');

const {none, finalValue, many, flushable} = gen;

unit.add(module, [
  function test_gen_separate(t) {
    const y = t.startAsync('test_gen_separate');

    const pipe = gen(x => x * x, x => 2 * x + 1);
    const output = [];

    (async () => {
      for (let i of [1, 2, 3]) {
        for await (let value of pipe(i)) {
          output.push(value);
        }
      }
    })().then(() => {
      eval(t.TEST('t.unify(output, [3, 9, 19])'));
      y.done();
    });
  },
  function test_genFinal(t) {
    test([1, 2, 3], gen(x => x * x, x => finalValue(x), x => 2 * x + 1), [1, 4, 9], t, t.startAsync('test_genFinal'));
  },
  function test_compNothing(t) {
    test([1, 2, 3], gen(x => x * x, () => none, x => 2 * x + 1), [], t, t.startAsync('test_compNothing'));
  },
  function test_genEmpty(t) {
    test([1, 2, 3], gen(), [1, 2, 3], t, t.startAsync('test_genEmpty'));
  },
  function test_genAsync(t) {
    test([1, 2, 3], gen(delay(x => x * x), x => 2 * x + 1), [3, 9, 19], t, t.startAsync('test_genAsync'));
  },
  function test_genGenerator(t) {
    test(
      [1, 2, 3],
      gen(
        x => x * x,
        function*(x) {
          yield x;
          yield x + 1;
          yield x + 2;
        },
        x => 2 * x + 1
      ),
      [3, 5, 7, 9, 11, 13, 19, 21, 23],
      t,
      t.startAsync('test_genGenerator')
    );
  },
  function test_genMany(t) {
    test(
      [1, 2, 3],
      gen(x => x * x, x => many([x, x + 1, x + 2]), x => 2 * x + 1),
      [3, 5, 7, 9, 11, 13, 19, 21, 23],
      t,
      t.startAsync('test_genMany')
    );
  },
  function test_genCombined(t) {
    test(
      [1, 2],
      gen(
        delay(x => -x),
        x => many([x, x * 10]),
        function*(x) {
          yield x;
          yield x - 1;
        },
        x => -x
      ),
      [1, 2, 10, 11, 2, 3, 20, 21],
      t,
      t.startAsync('test_genCombined')
    );
  },
  function test_genCombinedFinal(t) {
    test(
      [1, 2],
      gen(
        delay(x => -x),
        x => many([x, x * 10]),
        function*(x) {
          yield x;
          yield finalValue(x - 1);
        },
        x => -x
      ),
      [1, -2, 10, -11, 2, -3, 20, -21],
      t,
      t.startAsync('test_genCombinedFinal')
    );
  },
  function test_genAsAsyncGen(t) {
    test(
      [1, 2],
      gen(
        delay(x => -x),
        x => many([x, x * 10]),
        async function*(x) {
          yield delay(x => x)(x);
          yield delay(x => finalValue(x - 1))(x);
        },
        x => -x
      ),
      [1, -2, 10, -11, 2, -3, 20, -21],
      t,
      t.startAsync('test_genAsAsyncGen')
    );
  },
  function test_genFlush(t) {
    let acc = 0;
    test([1, 2, 3], gen(x => x * x, flushable(x => ((acc += x), none), () => acc)), [14], t, t.startAsync('test_genFlush'));
  },
  function test_genFlushCompact(t) {
    let acc = 0;
    test(
      [1, 2, 3],
      gen(x => x * x, flushable(x => ((acc += x), none), () => acc)),
      [14],
      t,
      t.startAsync('test_genFlushCompact')
    );
  },
  function test_genFlushShort(t) {
    let acc = 0;
    test(
      [1, 2, 3],
      gen(x => x * x, flushable(x => (x !== none ? ((acc += x), none) : acc))),
      [14],
      t,
      t.startAsync('test_genFlushShort')
    );
  },
  function test_genFlushEmbed(t) {
    let acc = 0;
    test(
      [1, 2, 3],
      gen(gen(x => x * x, flushable(x => ((acc += x), none), () => acc)), x => x + 1),
      [15],
      t,
      t.startAsync('test_genFlushEmbed')
    );
  }
]);
