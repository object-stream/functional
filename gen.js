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

const next = async function*(value, fns, index) {
  for (let i = index; i <= fns.length; ++i) {
    if (value && typeof value.then == 'function') {
      // thenable
      value = await value;
    }
    if (value === none) break;
    if (isFinal(value)) {
      const val = getFinalValue(value);
      if (val !== none) yield val;
      break;
    }
    if (isMany(value)) {
      const values = getManyValues(value);
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
    value = isFlush(f) ? f.write(value) : f(value);
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
    return async function*() {
      if (flushed) throw Error('Call to a flushed pipe.');
      yield* next(undefined, fns, 0);
      flushed = true;
      for (let i = 0; i < fns.length; ++i) {
        const f = fns[i];
        if (isFlush(f)) {
          const g = getFlushValue(f);
          yield* next(g ? g.call(f) : f.write(none), fns, i + 1);
        }
      }
    };
  }
  return async function*(value) {
    if (flushed) throw Error('Call to a flushed pipe.');
    if (value !== none) {
      yield* next(value, fns, 0);
    } else {
      flushed = true;
      for (let i = 0; i < fns.length; ++i) {
        const f = fns[i];
        if (isFlush(f)) {
          const g = getFlushValue(f);
          yield* next(g ? g.call(f) : f.write(none), fns, i + 1);
        }
      }
    }
  };
};

gen.next = next;

gen.none = none;
gen.final = final;
gen.isFinal = isFinal;
gen.getFinalValue = getFinalValue;
gen.many = many;
gen.isMany = isMany;
gen.getManyValues = getManyValues;
gen.flush = flush;
gen.isFlush = isFlush;
gen.getFlushValue = getFlushValue;

module.exports = gen;
