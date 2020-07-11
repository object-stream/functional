// source (iterator or a function) filtered by another function

'use strict';

const {none} = require('../../defs');

class Source {
  constructor(src, fn) {
    this.fn = fn;
    if (typeof src[Symbol.iterator] == 'function') {
      this.topIter = src[Symbol.iterator]();
    } else if (typeof src[Symbol.asyncIterator] == 'function') {
      this.topIter = src[Symbol.asyncIterator]();
    } else {
      this.topIter = src();
    }
    this.iter = null;
  }
  async next() {
    for (;;) {
      if (this.topIter === none && !this.iter) return {done: true};

      if (this.iter) {
        let result = this.iter.next();
        if (result && typeof result.then == 'function') {
          result = await result;
        }
        if (result.done) {
          this.iter = null;
          continue;
        }
        return result;
      }

      if (this.topIter && typeof this.topIter.next == 'function') {
        let result = this.topIter.next();
        if (result && typeof result.then == 'function') {
          result = await result;
        }
        if (result.done) {
          this.topIter = none;
          continue;
        }
        result = this.fn(result.value);
        if (result && typeof result.then == 'function') {
          result = await result;
        }
        if (result && typeof result.next == 'function') {
          this.iter = result;
          continue;
        }
        return {value: result};
      }

      let result = this.topIter;
      this.topIter = none;
      if (result && typeof result.then == 'function') {
        result = await result;
      }
      result = this.fn(result);
      if (result && typeof result.then == 'function') {
        result = await result;
      }
      if (result && typeof result.next == 'function') {
        this.iter = result;
        continue;
      }
      return {value: result};
    }
  }
  async return(value) {
    let result;
    if (this.iter && typeof this.iter.return == 'function') {
      result = this.iter.return(value);
      this.iter = null;
    }
    if (this.topIter && typeof this.topIter.return == 'function') {
      result = this.topIter.return(value);
      this.topIter = none;
    }
    return result || {done: true};
  }
  async throw(value) {
    let result;
    if (this.iter && typeof this.iter.throw == 'function') {
      result = this.iter.throw(value);
      this.iter = null;
    }
    if (this.topIter && typeof this.topIter.throw == 'function') {
      result = this.topIter.throw(value);
      this.topIter = none;
    }
    return result || {done: true};
  }
}

const source = (src, fn) => ({[Symbol.asyncIterator]: () => new Source(src, fn)});

module.exports = source;
