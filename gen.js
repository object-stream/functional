'use strict';

const defs = require('./defs');

const next = async function*(value, fns, index) {
  for (let i = index; i <= fns.length; ++i) {
    if (value && typeof value.then == 'function') {
      // thenable
      value = await value;
    }
    if (value === defs.none) break;
    if (value === defs.stop) throw new defs.Stop();
    if (defs.isFinalValue(value)) {
      yield value.value;
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
    value = f(value);
  }
};

const gen = (...fns) => {
  fns = fns.filter(fn => fn);
  if (!fns.length) fns = [x => x];
  let flushed = false;
  return defs.flushable(async function*(value) {
    if (flushed) throw Error('Call to a flushed pipe.');
    if (value !== defs.none) {
      yield* next(value, fns, 0);
    } else {
      flushed = true;
      for (let i = 0; i < fns.length; ++i) {
        const f = fns[i];
        if (defs.isFlushable(f)) {
          yield* next(f(defs.none), fns, i + 1);
        }
      }
    }
  });
};

gen.next = next;

Object.assign(gen, defs);

module.exports = gen;
