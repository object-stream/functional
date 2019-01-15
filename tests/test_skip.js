'use strict';

const unit = require('heya-unit');

const fun = require('../fun');
const {test, delay} = require('./helpers');

const skip = require('../utils/skip');
const skipWhile = require('../utils/skipWhile');

unit.add(module, [
  function test_skip(t) {
    test([1, 2, 3, 4, 5], fun(skip(2)), [3, 4, 5], t, t.startAsync('test_skip'));
  },
  function test_skipWhile(t) {
    test([1, 2, 3, 4, 5], fun(skipWhile(x => x != 3)), [3, 4, 5], t, t.startAsync('test_skipWhile'));
  },
  function test_skipWhileAsync(t) {
    test([1, 2, 3, 4, 5], fun(skipWhile(delay(x => x != 3))), [3, 4, 5], t, t.startAsync('test_skipWhileAsync'));
  }
]);
