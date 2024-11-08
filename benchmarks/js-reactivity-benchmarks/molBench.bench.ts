// adapted from https://github.com/milomg/js-reactivity-benchmark/blob/main/src/molBench.ts

import { bench } from 'vitest';
import { batch, computed, writable } from '../../src';

function fib(n: number): number {
  if (n < 2) return 1;
  return fib(n - 1) + fib(n - 2);
}

function hard(n: number) {
  return n + fib(16);
}

const numbers = Array.from({ length: 5 }, (_, i) => i);

const res = [];

const A = writable(0);
const B = writable(0);
const C = computed(() => (A() % 2) + (B() % 2));
const D = computed(() => numbers.map((i) => ({ x: i + (A() % 2) - (B() % 2) })));
const E = computed(() => hard(C() + A() + D()[0].x /*, 'E'*/));
const F = computed(() => hard(D()[2].x || B() /*, 'F'*/));
const G = computed(() => C() + (C() || E() % 2) + D()[4].x + F());
computed(() => res.push(hard(G() /*, 'H'*/))).subscribe(() => {});
computed(() => res.push(G())).subscribe(() => {});
computed(() => res.push(hard(F() /*, 'J'*/))).subscribe(() => {});

bench(
  'molBench',
  () => {
    for (let i = 0; i < 1e4; i++) {
      res.length = 0;
      batch(() => {
        B.set(1);
        A.set(1 + i * 2);
      });
      batch(() => {
        A.set(2 + i * 2);
        B.set(2);
      });
    }
  },
  { throws: true }
);
