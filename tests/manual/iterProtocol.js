class Iterable {
  constructor(array) {
    this.array = array;
    this.index = 0;
  }
  [Symbol.iterator]() {
    console.log('iterator');
    this.index = 0;
    return this;
  }
  next(value) {
    console.log('next()', value);
    return this.index < this.array.length ? {value: this.array[this.index++]} : {done: true};
  }
  return(value) {
    console.log('return()', value);
    this.index = this.array.length;
    return {done: true, value};
  }
  throw(error) {
    console.log('throw()', error);
    // throw error;
    this.index = this.array.length;
    return {done: true, value: error};
  }
}

const iterable = new Iterable([1, 2, 3]);

for (const value of iterable) {
  console.log('got:', value);
  if (value === 2) break;
}

for (const value of iterable) {
  console.log('got:', value);
}

for (const value of iterable) {
  console.log('got:', value);
  if (value === 2) iterable.throw(Error('bad1'));
}

for (const value of iterable) {
  console.log('got:', value);
  if (value === 2) throw Error('bad2');
}
