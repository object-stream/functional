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
      const val = value.value;
      val !== defs.none && push(val);
      break;
    }
    if (defs.isMany(value)) {
      const values = value.values;
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
    value = f instanceof defs.Flush ? f.write(value) : f(value);
  }
};

const collect = collect => (...fns) => {
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
    return defs.markReadOnly(
      defs.markFlush(async () => {
        if (flushed) throw Error('Call to a flushed pipe.');
        await next(undefined, fns, 0, collect);
        flushed = true;
        for (let i = 0; i < fns.length; ++i) {
          const f = fns[i];
          if (f instanceof defs.Flush) {
            await next(f.flush(), fns, i + 1, collect);
          } else if (defs.isFlush(f)) {
            await next(f(defs.none), fns, i + 1, collect);
          }
        }
      })
    );
  }
  return defs.markFlush(async value => {
    if (flushed) throw Error('Call to a flushed pipe.');
    if (value !== defs.none) {
      await next(value, fns, 0, collect);
    } else {
      flushed = true;
      for (let i = 0; i < fns.length; ++i) {
        const f = fns[i];
        if (f instanceof defs.Flush) {
          debugger;
          await next(f.flush(), fns, i + 1, collect);
        } else if (defs.isFlush(f)) {
          debugger;
          await next(f(defs.none), fns, i + 1, collect);
        }
      }
    }
  });
};

const asArray = (...fns) => {
  let results = [],
    push = value => results.push(value);
  const f = collect(push)(...fns);
  let g = async value => {
    results = [];
    await f(value);
    return results;
  };
  if (defs.isFlush(f)) g = defs.markFlush(g);
  if (defs.isReadOnly(f)) g = defs.markReadOnly(g);
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
  if (defs.isFlush(f)) g = defs.markFlush(g);
  if (defs.isReadOnly(f)) g = defs.markReadOnly(g);
  return g;
};

fun.next = next;
fun.collect = collect;
fun.asArray = asArray;

Object.assign(fun, defs);

module.exports = fun;
