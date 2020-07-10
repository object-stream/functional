'use strict';

const unit = require('heya-unit');

const fun = require('../fun');
const {test, delay} = require('./helpers');

const fold = require('../utils/fold');
const scan = require('../utils/scan');

unit.add(module, [
  function test_fun_fold(t) {
    test([1, 2, 3], fun(fold((acc, x) => acc + x, 0)), [6], t, t.startAsync('test_fun_fold'));
  },
  function test_fun_foldAsync(t) {
    test(
      [1, 2, 3],
      fun(
        fold(
          delay((acc, x) => acc + x),
          0
        )
      ),
      [6],
      t,
      t.startAsync('test_fun_foldAsync')
    );
  },
  function test_fun_foldScan(t) {
    test([1, 2, 3], fun(scan((acc, x) => acc + x, 0)), [1, 3, 6], t, t.startAsync('test_fun_foldScan'));
  },
  function test_fun_foldScanAsync(t) {
    test(
      [1, 2, 3],
      fun(
        scan(
          delay((acc, x) => acc + x),
          0
        )
      ),
      [1, 3, 6],
      t,
      t.startAsync('test_fun_foldScanAsync')
    );
  }
]);
