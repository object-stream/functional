'use strict';

const unit = require('heya-unit');

const fun = require('../fun');
const {test, delay} = require('./helpers');

const take = require('../utils/take');
const takeWithSkip = require('../utils/takeWithSkip');
const takeWhile = require('../utils/takeWhile');

unit.add(module, [
  function test_take(t) {
    test([1, 2, 3, 4, 5], fun(take(2)), [1, 2], t, t.startAsync('test_take'));
  },
  function test_takeWithSkip(t) {
    test([1, 2, 3, 4, 5], fun(takeWithSkip(2, 2)), [3, 4], t, t.startAsync('test_takeWithSkip'));
  },
  function test_takeWhile(t) {
    test([1, 2, 3, 4, 5], fun(takeWhile(x => x != 3)), [1, 2], t, t.startAsync('test_takeWhile'));
  },
  function test_takeWhileAsync(t) {
    test([1, 2, 3, 4, 5], fun(takeWhile(delay(x => x != 3))), [1, 2], t, t.startAsync('test_takeWhileAsync'));
  }
]);
