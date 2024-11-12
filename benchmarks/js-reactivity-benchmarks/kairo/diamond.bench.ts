// adapted from https://github.com/milomg/js-reactivity-benchmark/blob/main/src/kairo/diamond.ts

import { bench, expect } from 'vitest';
import type { ReadableSignal } from '../../../src';
import { computed, writable } from '../../../src';
import { setup } from '../../gc';

const width = 5;

const head = writable(0);
const current: ReadableSignal<number>[] = [];
for (let i = 0; i < width; i++) {
  current.push(computed(() => head() + 1));
}
const sum = computed(() => current.map((x) => x()).reduce((a, b) => a + b, 0));
let callCounter = 0;
computed(() => {
  sum();
  callCounter++;
}).subscribe(() => {});

bench(
  'diamond',
  () => {
    head.set(1);
    expect(sum()).toBe(2 * width);
    const atleast = 500;
    callCounter = 0;
    for (let i = 0; i < 500; i++) {
      head.set(i);
      expect(sum()).toBe((i + 1) * width);
    }
    expect(callCounter).toBe(atleast);
  },
  { throws: true, setup }
);
