'use strict';

const defs = require('./defs');

const next = async (value, fns, index, push) => {
  for (let i = index; i <= fns.length; ++i) {
    if (value && typeof value.then == 'function') {
      // thenable
      value = await value;
    }
    if (value === defs.none) break;
    if (defs.isFinal(value)) {
      const val = defs.getFinalValue(value);
      val !== defs.none && push(val);
      break;
    }
    if (defs.isMany(value)) {
      const values = defs.getManyValues(value);
      if (i == fns.length) {
        values.forEach(val => push(val));
      } else {
        for (let j = 0; j < values.length; ++j) {
          await next(values[j], fns, i, push);
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
          push(data.value);
        } else {
          await next(data.value, fns, i, push);
        }
      }
      break;
    }
    if (i == fns.length) {
      push(value);
      break;
    }
    const f = fns[i];
    value = defs.isFlush(f) ? f.write(value) : f(value);
  }
};

const asArray = (...fns) => {
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
    return async () => {
      if (flushed) throw Error('Call to a flushed pipe.');
      const results = [];
      await next(undefined, fns, 0, value => results.push(value)).then(() => results);
      flushed = true;
      for (let i = 0; i < fns.length; ++i) {
        const f = fns[i];
        if (defs.isFlush(f)) {
          const g = defs.getFlushValue(f);
          await next(g ? g.call(f) : f.write(defs.none), fns, i + 1, value => results.push(value));
        }
      }
      return results;
    };
  }
  return async value => {
    if (flushed) throw Error('Call to a flushed pipe.');
    const results = [];
    if (value !== defs.none) {
      return next(value, fns, 0, value => results.push(value)).then(() => results);
    }
    flushed = true;
    for (let i = 0; i < fns.length; ++i) {
      const f = fns[i];
      if (defs.isFlush(f)) {
        const g = defs.getFlushValue(f);
        await next(g ? g.call(f) : f.write(defs.none), fns, i + 1, value => results.push(value));
      }
    }
    return results;
  };
};

const fun = (...fns) => {
  const f = asArray(...fns);
  return async value =>
    f(value).then(results => {
      switch (results.length) {
        case 0:
          return defs.none;
        case 1:
          return results[0];
      }
      return defs.many(results);
    });
};

fun.next = next;
fun.asArray = asArray;

Object.assign(fun, defs);

module.exports = fun;
