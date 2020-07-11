'use strict';

const {stop} = require('../defs');

const takeWhile = (f, finalValue = stop) => {
  let test = true;
  return value => {
    if (!test) return finalValue;
    const result = f(value);
    if (result && typeof result.then == 'function') {
      return result.then(result => {
        if (result) return value;
        test = false;
        return finalValue;
      });
    }
    if (result) return value;
    test = false;
    return finalValue;
  };
};

module.exports = takeWhile;
