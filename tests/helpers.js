const test = (source, pipe, result, t, y) => {
  let p;
  if (source) {
    p = async () => {
      const output = [];
      for (let x of source) {
        for await (let v of pipe(x)) {
          output.push(v);
        }
      }
      return output;
    };
  } else {
    p = async () => {
      const output = [];
      for await (let v of pipe()) {
        output.push(v);
      }
      return output;
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
