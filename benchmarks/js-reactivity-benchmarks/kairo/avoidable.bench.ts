// adapted from https://github.com/milomg/js-reactivity-benchmark/blob/main/src/kairo/avoidable.ts

import { bench, expect } from 'vitest';
import { computed, writable } from '../../../src';
import { setup } from '../../gc';

function busy() {
  let a = 0;
  for (let i = 0; i < 1_00; i++) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    a++;
  }
}

const head = writable(0);
const computed1 = computed(() => head());
const computed2 = computed(() => (computed1(), 0));
const computed3 = computed(() => (busy(), computed2() + 1)); // heavy computation
const computed4 = computed(() => computed3() + 2);
const computed5 = computed(() => computed4() + 3);
computed(() => {
  computed5();
  busy(); // heavy side effect
}).subscribe(() => {});

bench(
  'avoidablePropagation',
  () => {
    head.set(1);
    expect(computed5()).toBe(6);
    for (let i = 0; i < 1000; i++) {
      head.set(i);
      expect(computed5()).toBe(6);
    }
  },
  { throws: true, setup }
);
