// adapted from https://github.com/milomg/js-reactivity-benchmark/blob/main/src/kairo/mux.ts

import { bench, expect } from 'vitest';
import { computed, writable } from '../../../src';

const heads = new Array(100).fill(null).map(() => writable(0));
const mux = computed(() => {
  return Object.fromEntries(heads.map((h) => h()).entries());
});
const splited = heads
  .map((_, index) => computed(() => mux()[index]))
  .map((x) => computed(() => x() + 1));

splited.forEach((x) => {
  computed(() => x()).subscribe(() => {});
});

bench(
  'mux',
  () => {
    for (let i = 0; i < 10; i++) {
      heads[i].set(i);
      expect(splited[i]()).toBe(i + 1);
    }
    for (let i = 0; i < 10; i++) {
      heads[i].set(i * 2);
      expect(splited[i]()).toBe(i * 2 + 1);
    }
  },
  { throws: true }
);
