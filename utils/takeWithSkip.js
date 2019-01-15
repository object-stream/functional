'use strict';

const {none} = require('../defs');

const takeWithSkip = (n, skip) => value => (skip > 0 ? (--skip, none) : n > 0 ? (--n, value) : none);

module.exports = takeWithSkip;
