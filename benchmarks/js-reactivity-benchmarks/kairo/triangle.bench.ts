// adapted from https://github.com/milomg/js-reactivity-benchmark/blob/main/src/kairo/triangle.ts

import { bench, expect } from 'vitest';
import type { ReadableSignal } from '../../../src';
import { computed, writable } from '../../../src';

const width = 10;

const head = writable(0);
let current = head as ReadableSignal<number>;
const list: ReadableSignal<number>[] = [];
for (let i = 0; i < width; i++) {
  const c = current;
  list.push(current);
  current = computed(() => {
    return c() + 1;
  });
}
const sum = computed(() => {
  return list.map((x) => x()).reduce((a, b) => a + b, 0);
});

let callCounter = 0;

computed(() => {
  sum();
  callCounter++;
}).subscribe(() => {});

bench(
  'triangle',
  () => {
    const constant = count(width);
    head.set(1);
    expect(sum()).toBe(constant);
    const atleast = 100;
    callCounter = 0;
    for (let i = 0; i < 100; i++) {
      head.set(i);
      expect(sum()).toBe(constant - width + i * width);
    }
    expect(callCounter).toBe(atleast);
  },
  { throws: true }
);

function count(number: number) {
  return new Array(number)
    .fill(0)
    .map((_, i) => i + 1)
    .reduce((x, y) => x + y, 0);
}
