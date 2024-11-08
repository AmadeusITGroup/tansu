// adapted from https://github.com/milomg/js-reactivity-benchmark/blob/main/src/kairo/deep.ts

import { bench, expect } from 'vitest';
import type { ReadableSignal } from '../../../src';
import { computed, writable } from '../../../src';

const len = 50;

const head = writable(0);
let current = head as ReadableSignal<number>;
for (let i = 0; i < len; i++) {
  const c = current;
  current = computed(() => {
    return c() + 1;
  });
}
let callCounter = 0;

computed(() => {
  current();
  callCounter++;
}).subscribe(() => {});

const iter = 50;

bench(
  'deep',
  () => {
    head.set(1);
    const atleast = iter;
    callCounter = 0;
    for (let i = 0; i < iter; i++) {
      head.set(i);
      expect(current()).toBe(len + i);
    }
    expect(callCounter).toBe(atleast);
  },
  { throws: true }
);
