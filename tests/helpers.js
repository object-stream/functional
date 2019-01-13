const {none, isMany} = require('../defs');

const test = (source, pipe, result, t, y) => {
  let p;
  if (source) {
    p = async () => {
      const output = [];
      for (let x of source) {
        const value = await pipe(x);
        if (isMany(value)) {
          output.push(...value.values);
        } else if (value !== none) {
          output.push(value);
        }
      }
      const value = await pipe(none);
      if (isMany(value)) {
        output.push(...value.values);
      } else if (value !== none) {
        output.push(value);
      }
      return output;
    };
  } else {
    p = async () => {
      const value = await pipe();
      if (isMany(value)) {
        return value.values;
      } else if (value !== none) {
        return [value];
      }
      return [];
    };
  }
  p().then(
    output => {
      eval(t.TEST('t.unify(output, result)'));
      y.done();
    },
    error => {
      eval(t.TEST('error === null'));
      y.done();
    }
  );
};

const delay = (fn, ms = 20) => async (...args) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(fn(...args));
      } catch (error) {
        reject(error);
      }
    }, ms);
  });

module.exports.test = test;
module.exports.delay = delay;
