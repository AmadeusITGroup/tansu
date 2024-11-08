// adapted from https://github.com/milomg/js-reactivity-benchmark/blob/main/src/kairo/repeated.ts

import { bench, expect } from 'vitest';
import { computed, writable } from '../../../src';

const size = 30;

const head = writable(0);
const current = computed(() => {
  let result = 0;
  for (let i = 0; i < size; i++) {
    // tbh I think it's meanigless to be this big...
    result += head();
  }
  return result;
});

let callCounter = 0;
computed(() => {
  current();
  callCounter++;
}).subscribe(() => {});

bench(
  'repeated',
  () => {
    head.set(1);
    expect(current()).toBe(size);
    const atleast = 100;
    callCounter = 0;
    for (let i = 0; i < 100; i++) {
      head.set(i);
      expect(current()).toBe(i * size);
    }
    expect(callCounter).toBe(atleast);
  },
  { throws: true }
);
