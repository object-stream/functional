'use strict';

const none = Symbol.for('object-stream.none');
const finalSymbol = Symbol.for('object-stream.final');
const manySymbol = Symbol.for('object-stream.many');

const final = value => ({[finalSymbol]: value});
const many = values => ({[manySymbol]: values});

const isFinal = o => o && typeof o == 'object' && finalSymbol in o;
const isMany = o => o && typeof o == 'object' && manySymbol in o;

const getFinalValue = o => o[finalSymbol];
const getManyValues = o => o[manySymbol];

const next = async function*(value, fns, index) {
  debugger;
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
    value = fns[i](value);
  }
};

const nop = async function*(x) {
  yield x;
};

const gen = (...fns) => {
  fns = fns.filter(fn => fn);
  if (!fns.length) return nop;
  if (Symbol.asyncIterator && typeof fns[0][Symbol.asyncIterator] == 'function') {
    const f = fns[0];
    fns[0] = () => f[Symbol.asyncIterator]();
  } else if (Symbol.iterator && typeof fns[0][Symbol.iterator] == 'function') {
    const f = fns[0];
    fns[0] = () => f[Symbol.iterator]();
  }
  return value => next(value, fns, 0);
};

gen.next = next;

gen.none = none;
gen.final = final;
gen.isFinal = isFinal;
gen.getFinalValue = getFinalValue;
gen.many = many;
gen.isMany = isMany;
gen.getManyValues = getManyValues;

module.exports = gen;
