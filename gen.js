'use strict';

const defs = require('./defs');

const next = async function*(value, fns, index) {
  for (let i = index; i <= fns.length; ++i) {
    if (value && typeof value.then == 'function') {
      // thenable
      value = await value;
    }
    if (value === defs.none) break;
    if (defs.isFinal(value)) {
      const val = value.value;
      if (val !== defs.none) yield val;
      break;
    }
    if (defs.isMany(value)) {
      const values = value.values;
      if (i == fns.length) {
        yield* values;
      } else {
        for (let j = 0; j < values.length; ++j) {
          yield* next(values[j], fns, i);
        }
      }
      break;
    }
    if (value && typeof value.next == 'function') {
      // generator
      for (;;) {
        let data = value.next();
        if (data && typeof data.then == 'function') {
          data = await data;
        }
        if (data.done) break;
        if (i == fns.length) {
          yield data.value;
        } else {
          yield* next(data.value, fns, i);
        }
      }
      break;
    }
    if (i == fns.length) {
      yield value;
      break;
    }
    const f = fns[i];
    value = typeof f == 'object' && defs.isFlush(f) ? f.write(value) : f(value);
  }
};

const nop = async function*(x) {
  yield x;
};

const gen = (...fns) => {
  fns = fns.filter(fn => fn);
  if (!fns.length) fns = [x => x];
  let autoFlushed = false;
  if (Symbol.asyncIterator && typeof fns[0][Symbol.asyncIterator] == 'function') {
    const f = fns[0];
    fns[0] = () => f[Symbol.asyncIterator]();
    autoFlushed = true;
  } else if (Symbol.iterator && typeof fns[0][Symbol.iterator] == 'function') {
    const f = fns[0];
    fns[0] = () => f[Symbol.iterator]();
    autoFlushed = true;
  }
  let flushed = false;
  if (autoFlushed) {
    return defs.markReadOnly(defs.markFlush(async function*() {
      if (flushed) throw Error('Call to a flushed pipe.');
      yield* next(undefined, fns, 0);
      flushed = true;
      for (let i = 0; i < fns.length; ++i) {
        const f = fns[i];
        if (defs.isFlush(f)) {
          yield* next(typeof f == 'function' ? f(defs.none) : f.flush ? f.flush() : f.write(defs.none), fns, i + 1);
        }
      }
    }));
  }
  return defs.markFlush(async function*(value) {
    if (flushed) throw Error('Call to a flushed pipe.');
    if (value !== defs.none) {
      yield* next(value, fns, 0);
    } else {
      flushed = true;
      for (let i = 0; i < fns.length; ++i) {
        const f = fns[i];
        if (defs.isFlush(f)) {
          yield* next(typeof f == 'function' ? f(defs.none) : f.flush ? f.flush() : f.write(defs.none), fns, i + 1);
        }
      }
    }
  });
};

gen.next = next;

Object.assign(gen, defs);

module.exports = gen;
