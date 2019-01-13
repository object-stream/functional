const none = Symbol.for('object-stream.none');
const manySymbol = Symbol.for('object-stream.many');
const isMany = o => o && typeof o == 'object' && manySymbol in o;
const getManyValues = o => o[manySymbol];

const testGen = (source, pipe, result, t, y) => {
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

const testAsync = (source, pipe, result, t, y) => {
  let p;
  if (source) {
    p = async () => {
      const output = [];
      for (let x of source) {
        const value = await pipe(x);
        if (isMany(value)) {
          output.push(...getManyValues(value));
        } else if (value !== none) {
          output.push(value);
        }
      }
      return output;
    };
  } else {
    p = async () => {
      const value = await pipe();
      if (isMany(value)) {
        return getManyValues(value);
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

module.exports.testGen = testGen;
module.exports.testAsync = testAsync;
module.exports.delay = delay;
