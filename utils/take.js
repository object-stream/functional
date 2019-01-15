'use strict';

const {none} = require('../defs');

const take = n => value => (n > 0 ? (--n, value) : none);

module.exports = take;
