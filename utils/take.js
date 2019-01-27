'use strict';

const {stop} = require('../defs');

const take = (n, finalValue = stop) => value => (n > 0 ? (--n, value) : finalValue);

module.exports = take;
