'use strict';

const {none, stop} = require('../defs');

const takeWithSkip = (n, skip = 0, finalValue = stop) => value =>
  skip > 0 ? (--skip, none) : n > 0 ? (--n, value) : finalValue;

module.exports = takeWithSkip;
