'use strict';

const unit = require('heya-unit');

const gen = require('../gen');
const {delay} = require('./helpers');
const {test} = require('./helpers-gen');

const take = require('../utils/take');
const takeWithSkip = require('../utils/takeWithSkip');
const takeWhile = require('../utils/takeWhile');

const natural = function* () {
  for (let i = 1; ; ++i) yield i;
};

unit.add(module, [
  function test_gen_take(t) {
    test([1, 2, 3, 4, 5], gen(take(2)), [1, 2], t, t.startAsync('test_gen_take'));
  },
  function test_gen_takeWithSkip(t) {
    test([1, 2, 3, 4, 5], gen(takeWithSkip(2, 2)), [3, 4], t, t.startAsync('test_gen_takeWithSkip'));
  },
  function test_gen_takeWhile(t) {
    test([1, 2, 3, 4, 5], gen(takeWhile(x => x != 3)), [1, 2], t, t.startAsync('test_gen_takeWhile'));
  },
  function test_gen_takeWhileAsync(t) {
    test([1, 2, 3, 4, 5], gen(takeWhile(delay(x => x != 3))), [1, 2], t, t.startAsync('test_gen_takeWhileAsync'));
  },
  function test_gen_take_infinite(t) {
    test(natural(), gen(take(2)), [1, 2], t, t.startAsync('test_gen_take_infinite'));
  },
  function test_gen_takeWithSkip_infinite(t) {
    test(natural(), gen(takeWithSkip(2, 2)), [3, 4], t, t.startAsync('test_gen_takeWithSkip_infinite'));
  },
  function test_gen_takeWhile_infinite(t) {
    test(natural(), gen(takeWhile(x => x != 3)), [1, 2], t, t.startAsync('test_gen_takeWhile_infinite'));
  },
  function test_gen_take_none(t) {
    test([1, 2, 3, 4, 5], gen(take(2, gen.none)), [1, 2], t, t.startAsync('test_gen_take'));
  },
  function test_gen_takeWithSkip_none(t) {
    test([1, 2, 3, 4, 5], gen(takeWithSkip(2, 2, gen.none)), [3, 4], t, t.startAsync('test_gen_takeWithSkip'));
  },
  function test_gen_takeWhile_none(t) {
    test([1, 2, 3, 4, 5], gen(takeWhile(x => x != 3, gen.none)), [1, 2], t, t.startAsync('test_gen_takeWhile'));
  }
]);
