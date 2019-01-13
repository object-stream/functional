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

module.exports = {none, final, many, flush, isFinal, isMany, isFlush, getFinalValue, getManyValues, getFlushValue};
