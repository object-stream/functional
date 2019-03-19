'use strict';

const unit = require('heya-unit');

const gen = require('../gen');
const {delay} = require('./helpers');
const {test} = require('./helpers-gen');

const skip = require('../utils/skip');
const skipWhile = require('../utils/skipWhile');

unit.add(module, [
  function test_gen_skip(t) {
    test([1, 2, 3, 4, 5], gen(skip(2)), [3, 4, 5], t, t.startAsync('test_gen_skip'));
  },
  function test_gen_skipWhile(t) {
    test([1, 2, 3, 4, 5], gen(skipWhile(x => x != 3)), [3, 4, 5], t, t.startAsync('test_gen_skipWhile'));
  },
  function test_gen_skipWhileAsync(t) {
    test([1, 2, 3, 4, 5], gen(skipWhile(delay(x => x != 3))), [3, 4, 5], t, t.startAsync('test_gen_skipWhileAsync'));
  }
]);
