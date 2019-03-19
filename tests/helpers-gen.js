const {none, Stop} = require('../defs');

const test = (source, pipe, result, t, y) => {
  let p;
  if (source) {
    p = async () => {
      const output = [];
      try {
        for (const x of source) {
          for await (const v of pipe(x)) {
            output.push(v);
          }
        }
      } catch (error) {
        if (!(error instanceof Stop)) throw error;
      } finally {
        for await (const v of pipe(none)) {
          output.push(v);
        }
      }
      return output;
    };
  } else {
    p = async () => {
      const output = [];
      for await (const v of pipe()) {
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

module.exports.test = test;
