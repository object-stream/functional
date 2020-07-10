'use strict';

const unit = require('heya-unit');

const gen = require('../gen');
const {delay} = require('./helpers');
const {test} = require('./helpers-gen');

const fold = require('../utils/fold');
const scan = require('../utils/scan');

unit.add(module, [
  function test_gen_fold(t) {
    test([1, 2, 3], gen(fold((acc, x) => acc + x, 0)), [6], t, t.startAsync('test_gen_fold'));
  },
  function test_gen_foldAsync(t) {
    test(
      [1, 2, 3],
      gen(
        fold(
          delay((acc, x) => acc + x),
          0
        )
      ),
      [6],
      t,
      t.startAsync('test_gen_foldAsync')
    );
  },
  function test_gen_foldScan(t) {
    test([1, 2, 3], gen(scan((acc, x) => acc + x, 0)), [1, 3, 6], t, t.startAsync('test_gen_foldScan'));
  },
  function test_gen_foldScanAsync(t) {
    test(
      [1, 2, 3],
      gen(
        scan(
          delay((acc, x) => acc + x),
          0
        )
      ),
      [1, 3, 6],
      t,
      t.startAsync('test_gen_foldScanAsync')
    );
  }
]);
