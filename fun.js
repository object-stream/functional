'use strict';

const none = Symbol.for('object-stream.none');
const finalSymbol = Symbol.for('object-stream.final');
const manySymbol = Symbol.for('object-stream.many');
const flushSymbol = Symbol.for('object-stream.flush');

const final = value => ({[finalSymbol]: value});
const many = values => ({[manySymbol]: values});
const flush = (write, flush = null) => ({write, [flushSymbol]: flush});

const isFinal = o => o && typeof o == 'object' && finalSymbol in o;
const isMany = o => o && typeof o == 'object' && manySymbol in o;
const isFlush = o => o && typeof o == 'object' && flushSymbol in o;

const getFinalValue = o => o[finalSymbol];
const getManyValues = o => o[manySymbol];
const getFlushValue = o => o[flushSymbol];

const next = async (value, fns, index, push) => {
  for (let i = index; i <= fns.length; ++i) {
    if (value && typeof value.then == 'function') {
      // thenable
      value = await value;
    }
    if (value === none) break;
    if (isFinal(value)) {
      const val = getFinalValue(value);
      val !== none && push(val);
      break;
    }
    if (isMany(value)) {
      const values = getManyValues(value);
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
    value = isFlush(f) ? f.write(value) : f(value);
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
        if (isFlush(f)) {
          const g = getFlushValue(f);
          await next(g ? g.call(f) : f.write(none), fns, i + 1, value => results.push(value));
        }
      }
      return results;
    };
  }
  return async value => {
    if (flushed) throw Error('Call to a flushed pipe.');
    const results = [];
    if (value !== none) {
      return next(value, fns, 0, value => results.push(value)).then(() => results);
    }
    flushed = true;
    for (let i = 0; i < fns.length; ++i) {
      const f = fns[i];
      if (isFlush(f)) {
        const g = getFlushValue(f);
        await next(g ? g.call(f) : f.write(none), fns, i + 1, value => results.push(value));
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
          return none;
        case 1:
          return results[0];
      }
      return many(results);
    });
};

fun.next = next;
fun.asArray = asArray;

fun.none = none;
fun.final = final;
fun.isFinal = isFinal;
fun.getFinalValue = getFinalValue;
fun.many = many;
fun.isMany = isMany;
fun.getManyValues = getManyValues;
fun.flush = flush;
fun.isFlush = isFlush;
fun.getFlushValue = getFlushValue;

module.exports = fun;
