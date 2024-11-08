// adapted from https://github.com/milomg/js-reactivity-benchmark/blob/main/src/kairo/unstable.ts

import { bench, expect } from 'vitest';
import { computed, writable } from '../../../src';

const head = writable(0);
const double = computed(() => head() * 2);
const inverse = computed(() => -head());
const current = computed(() => {
  let result = 0;
  for (let i = 0; i < 20; i++) {
    result += head() % 2 ? double() : inverse();
  }
  return result;
});

let callCounter = 0;
computed(() => {
  current();
  callCounter++;
}).subscribe(() => {});

bench(
  'unstable',
  () => {
    head.set(1);
    expect(current()).toBe(40);
    const atleast = 100;
    callCounter = 0;
    for (let i = 0; i < 100; i++) {
      head.set(i);
      // expect(current()).toBe(i % 2 ? i * 2 * 10 : i * -10);
    }
    expect(callCounter).toBe(atleast);
  },
  { throws: true }
);
