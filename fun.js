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
    value = fns[i](value);
  }
};

const nop = async x => x;

const fun = (...fns) => {
  fns = fns.filter(fn => fn);
  if (!fns.length) return nop;
  if (Symbol.asyncIterator && typeof fns[0][Symbol.asyncIterator] == 'function') {
    const f = fns[0];
    fns[0] = async function*() { yield* f[Symbol.asyncIterator](); };
  } else if (Symbol.iterator && typeof fns[0][Symbol.iterator] == 'function') {
    const f = fns[0];
    fns[0] = function*() { yield* f[Symbol.iterator](); };
  }
  return async value => {
    const results = [];
    await next(value, fns, 0, value => results.push(value));
    switch (results.length) {
      case 0:
        return none;
      case 1:
        return results[0];
    }
    return many(results);
  };
};

fun.next = next;

fun.none = none;
fun.final = final;
fun.isFinal = isFinal;
fun.getFinalValue = getFinalValue;
fun.many = many;
fun.isMany = isMany;
fun.getManyValues = getManyValues;

module.exports = fun;
