const none = Symbol.for('object-stream.none');

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
      for await (let v of pipe(none)) {
        output.push(v);
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

module.exports.test = test;
