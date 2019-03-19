'use strict';

const defs = require('./defs');

const next = async (value, fns, index, collect) => {
  for (let i = index; i <= fns.length; ++i) {
    if (value && typeof value.then == 'function') {
      // thenable
      value = await value;
    }
    if (value === defs.none) break;
    if (value === defs.stop) throw new defs.Stop();
    if (defs.isFinalValue(value)) {
      collect(value.value);
      break;
    }
    if (defs.isMany(value)) {
      const values = value.values;
      if (i == fns.length) {
        values.forEach(val => collect(val));
      } else {
        for (let j = 0; j < values.length; ++j) {
          await next(values[j], fns, i, collect);
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
          collect(data.value);
        } else {
          await next(data.value, fns, i, collect);
        }
      }
      break;
    }
    if (i == fns.length) {
      collect(value);
      break;
    }
    const f = fns[i];
    value = f(value);
  }
};

const collect = (collect, fns) => {
  fns = fns.filter(fn => fn);
  if (!fns.length) fns = [x => x];
  let flushed = false;
  return defs.flushable(async value => {
    if (flushed) throw Error('Call to a flushed pipe.');
    if (value !== defs.none) {
      await next(value, fns, 0, collect);
    } else {
      flushed = true;
      for (let i = 0; i < fns.length; ++i) {
        const f = fns[i];
        if (defs.isFlushable(f)) {
          await next(f(defs.none), fns, i + 1, collect);
        }
      }
    }
  });
};

const asArray = (...fns) => {
  let results = null;
  const f = collect(value => results.push(value), fns);
  let g = async value => {
    results = [];
    await f(value);
    const r = results;
    results = null;
    return r;
  };
  if (defs.isFlushable(f)) g = defs.flushable(g);
  return g;
};

const fun = (...fns) => {
  const f = asArray(...fns);
  let g = async value =>
    f(value).then(results => {
      switch (results.length) {
        case 0:
          return defs.none;
        case 1:
          return results[0];
      }
      return defs.many(results);
    });
  if (defs.isFlushable(f)) g = defs.flushable(g);
  return g;
};

fun.next = next;
fun.collect = collect;
fun.asArray = asArray;

Object.assign(fun, defs);

module.exports = fun;
