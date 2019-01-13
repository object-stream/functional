'use strict';

const unit = require('heya-unit');
const {test, delay} = require('./helpers');
const fun = require('../fun');

const {none, final, many, flush} = fun;

unit.add(module, [
  function test_fun_compact(t) {
    test(null, fun([1, 2, 3], x => x * x, x => 2 * x + 1), [3, 9, 19], t, t.startAsync('test_fun_compact'));
  },
  function test_fun_separate(t) {
    test([1, 2, 3], fun(x => x * x, x => 2 * x + 1), [3, 9, 19], t, t.startAsync('test_fun_separate'));
  },
  function test_funFinal(t) {
    test([1, 2, 3], fun(x => x * x, x => final(x), x => 2 * x + 1), [1, 4, 9], t, t.startAsync('test_funFinal'));
  },
  function test_funNothing(t) {
    test([1, 2, 3], fun(x => x * x, () => none, x => 2 * x + 1), [], t, t.startAsync('test_funNothing'));
  },
  function test_funEmpty(t) {
    test([1, 2, 3], fun(), [1, 2, 3], t, t.startAsync('test_funEmpty'));
  },
  function test_funAsync(t) {
    test([1, 2, 3], fun(delay(x => x * x), x => 2 * x + 1), [3, 9, 19], t, t.startAsync('test_funAsync'));
  },
  function test_funGenerator(t) {
    test(
      [1, 2, 3],
      fun(
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
      t.startAsync('test_funGenerator')
    );
  },
  function test_funMany(t) {
    test(
      [1, 2, 3],
      fun(x => x * x, x => many([x, x + 1, x + 2]), x => 2 * x + 1),
      [3, 5, 7, 9, 11, 13, 19, 21, 23],
      t,
      t.startAsync('test_funMany')
    );
  },
  function test_funCombined(t) {
    test(
      [1, 2],
      fun(
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
      t.startAsync('test_funCombined')
    );
  },
  function test_funCombinedFinal(t) {
    test(
      [1, 2],
      fun(
        delay(x => -x),
        x => many([x, x * 10]),
        function*(x) {
          yield x;
          yield final(x - 1);
        },
        x => -x
      ),
      [1, -2, 10, -11, 2, -3, 20, -21],
      t,
      t.startAsync('test_funCombinedFinal')
    );
  },
  function test_funAsArray(t) {
    const y = t.startAsync('test_funAsArray');
    fun
      .asArray([1, 2, 3], x => x * x, x => 2 * x + 1)()
      .then(output => {
        eval(t.TEST('t.unify(output, [3, 9, 19])'));
        y.done();
      });
  },
  function test_funFlush(t) {
    let acc = 0;
    test([1, 2, 3], fun(x => x * x, flush(x => ((acc += x), none), () => acc)), [14], t, t.startAsync('test_funFlush'));
  },
  function test_funFlushCompact(t) {
    let acc = 0;
    test(
      null,
      fun([1, 2, 3], x => x * x, flush(x => ((acc += x), none), () => acc)),
      [14],
      t,
      t.startAsync('test_funFlushCompact')
    );
  },
  function test_funFlushShort(t) {
    let acc = 0;
    test(
      null,
      fun([1, 2, 3], x => x * x, flush(x => (x !== none ? ((acc += x), none) : acc))),
      [14],
      t,
      t.startAsync('test_funFlushShort')
    );
  }
]);
