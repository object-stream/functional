'use strict';

const {none} = require('../defs');

const takeWhile = f => {
  let test = true;
  return value => {
    if (!test) return none;
    const result = f(value);
    if (result && typeof result.then == 'function') {
      return result.then(result => {
        if (result) return value;
        test = false;
        return none;
      });
    }
    if (result) return value;
    test = false;
    return none;
  };
};

module.exports = takeWhile;
