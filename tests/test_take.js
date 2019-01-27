'use strict';

const unit = require('heya-unit');

const fun = require('../fun');
const {test, delay} = require('./helpers');

const take = require('../utils/take');
const takeWithSkip = require('../utils/takeWithSkip');
const takeWhile = require('../utils/takeWhile');

const natural = function*() {
  for (let i = 1; ; ++i) yield i;
};

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
  },
  function test_take_infinite(t) {
    test(natural(), fun(take(2)), [1, 2], t, t.startAsync('test_take_infinite'));
  },
  function test_takeWithSkip_infinite(t) {
    test(natural(), fun(takeWithSkip(2, 2)), [3, 4], t, t.startAsync('test_takeWithSkip_infinite'));
  },
  function test_takeWhile_infinite(t) {
    test(natural(), fun(takeWhile(x => x != 3)), [1, 2], t, t.startAsync('test_takeWhile_infinite'));
  },
  function test_take_none(t) {
    test([1, 2, 3, 4, 5], fun(take(2, fun.none)), [1, 2], t, t.startAsync('test_take'));
  },
  function test_takeWithSkip_none(t) {
    test([1, 2, 3, 4, 5], fun(takeWithSkip(2, 2, fun.none)), [3, 4], t, t.startAsync('test_takeWithSkip'));
  },
  function test_takeWhile_none(t) {
    test([1, 2, 3, 4, 5], fun(takeWhile(x => x != 3, fun.none)), [1, 2], t, t.startAsync('test_takeWhile'));
  }
]);
