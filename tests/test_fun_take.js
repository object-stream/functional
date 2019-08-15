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

const stop = fun.stop;

unit.add(module, [
  function test_fun_take(t) {
    test([1, 2, 3, 4, 5], fun(take(2)), [1, 2], t, t.startAsync('test_fun_take'));
  },
  function test_fun_takeWithSkip(t) {
    test([1, 2, 3, 4, 5], fun(takeWithSkip(2, 2)), [3, 4], t, t.startAsync('test_fun_takeWithSkip'));
  },
  function test_fun_takeWhile(t) {
    test([1, 2, 3, 4, 5], fun(takeWhile(x => x != 3)), [1, 2], t, t.startAsync('test_fun_takeWhile'));
  },
  function test_fun_takeWhileAsync(t) {
    test([1, 2, 3, 4, 5], fun(takeWhile(delay(x => x != 3))), [1, 2], t, t.startAsync('test_fun_takeWhileAsync'));
  },
  function test_fun_take_infinite(t) {
    test(natural(), fun(take(2, stop)), [1, 2], t, t.startAsync('test_fun_take_infinite'));
  },
  function test_fun_takeWithSkip_infinite(t) {
    test(natural(), fun(takeWithSkip(2, 2, stop)), [3, 4], t, t.startAsync('test_fun_takeWithSkip_infinite'));
  },
  function test_fun_takeWhile_infinite(t) {
    test(natural(), fun(takeWhile(x => x != 3, stop)), [1, 2], t, t.startAsync('test_fun_takeWhile_infinite'));
  },
  function test_fun_take_none(t) {
    test([1, 2, 3, 4, 5], fun(take(2, fun.none)), [1, 2], t, t.startAsync('test_fun_take'));
  },
  function test_fun_takeWithSkip_none(t) {
    test([1, 2, 3, 4, 5], fun(takeWithSkip(2, 2, fun.none)), [3, 4], t, t.startAsync('test_fun_takeWithSkip'));
  },
  function test_fun_takeWhile_none(t) {
    test([1, 2, 3, 4, 5], fun(takeWhile(x => x != 3, fun.none)), [1, 2], t, t.startAsync('test_fun_takeWhile'));
  }
]);
