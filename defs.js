const none = Symbol.for('object-stream.none');
const finalSymbol = Symbol.for('object-stream.final');
const manySymbol = Symbol.for('object-stream.many');
const flushSymbol = Symbol.for('object-stream.flush');
const readOnlySymbol = Symbol.for('object-stream.readOnly');

const isFinal = o => o && o[finalSymbol] === 1;
const isMany = o => o && o[manySymbol] === 1;
const isFlush = o => o && o[flushSymbol] === 1;
const isReadOnly = o => o && o[readOnlySymbol] === 1;

const markAsFlush = o => ((o[flushSymbol] = 1), o);
const markAsReadOnly = o => ((o[readOnlySymbol] = 1), o);

const final = value => ({[finalSymbol]: 1, value});
const many = values => ({[manySymbol]: 1, values});

class StreamLike {
  constructor(options) {
    options.write && (this.write = options.write);
    options.flush && (this.flush = options.flush);
  }
  write (value) {
    return value;
  }
  flush () {
    return this.write(none);
  }
}

const flush = (write, flush = null) => new StreamLike({write, flush});

module.exports = {none, final, many, flush, StreamLike, isFinal, isMany, isFlush, isReadOnly, markAsFlush, markAsReadOnly};
