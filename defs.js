const none = Symbol.for('object-stream.none');
const finalSymbol = Symbol.for('object-stream.final');
const manySymbol = Symbol.for('object-stream.many');
const flushSymbol = Symbol.for('object-stream.flush');
const readOnlySymbol = Symbol.for('object-stream.readOnly');

const isFinal = o => o && o[finalSymbol] === 1;
const isMany = o => o && o[manySymbol] === 1;
const isFlush = o => o && o[flushSymbol] === 1;

const markFlush = o => ((o[flushSymbol] = 1), o);
const markReadOnly = o => ((o[readOnlySymbol] = 1), o);

const final = value => ({[finalSymbol]: 1, value});
const many = values => ({[manySymbol]: 1, values});
const flush = (write, flush = null) => ({[flushSymbol]: 1, write, flush});

module.exports = {none, final, many, flush, isFinal, isMany, isFlush, markFlush, markReadOnly};
