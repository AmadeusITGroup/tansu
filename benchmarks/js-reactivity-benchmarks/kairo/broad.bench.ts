// adapted from https://github.com/milomg/js-reactivity-benchmark/blob/main/src/kairo/broad.ts

import { bench, expect } from 'vitest';
import type { ReadableSignal } from '../../../src';
import { computed, writable } from '../../../src';
import { setup } from '../../gc';

const loopCount = 50;

const head = writable(0);
let last: ReadableSignal<number> = head;
let callCounter = 0;
for (let i = 0; i < loopCount; i++) {
  const current = computed(() => {
    return head() + i;
  });
  const current2 = computed(() => {
    return current() + 1;
  });
  computed(() => {
    current2();
    callCounter++;
  }).subscribe(() => {});
  last = current2;
}

bench(
  'broad',
  () => {
    head.set(1);
    const atleast = loopCount * loopCount;
    callCounter = 0;
    for (let i = 0; i < loopCount; i++) {
      head.set(i);
      expect(last()).toBe(i + loopCount);
    }
    expect(callCounter).toBe(atleast);
  },
  { throws: true, setup }
);
