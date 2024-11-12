// adapted from https://github.com/milomg/js-reactivity-benchmark/blob/main/src/cellxBench.ts

import { bench, expect } from 'vitest';
import { batch, computed, writable } from '../../src';
import type { ReadableSignal } from '../../src';
import { setup } from '../gc';

// The following is an implementation of the cellx benchmark https://github.com/Riim/cellx/blob/master/perf/perf.html

const cellx = (
  layers: number,
  expectedBefore: readonly [number, number, number, number],
  expectedAfter: readonly [number, number, number, number]
) => {
  const start = {
    prop1: writable(1),
    prop2: writable(2),
    prop3: writable(3),
    prop4: writable(4),
  };

  let layer: {
    prop1: ReadableSignal<number>;
    prop2: ReadableSignal<number>;
    prop3: ReadableSignal<number>;
    prop4: ReadableSignal<number>;
  } = start;

  for (let i = layers; i > 0; i--) {
    const m = layer;
    const s = {
      prop1: computed(() => m.prop2()),
      prop2: computed(() => m.prop1() - m.prop3()),
      prop3: computed(() => m.prop2() + m.prop4()),
      prop4: computed(() => m.prop3()),
    };

    computed(() => s.prop1()).subscribe(() => {});
    computed(() => s.prop2()).subscribe(() => {});
    computed(() => s.prop3()).subscribe(() => {});
    computed(() => s.prop4()).subscribe(() => {});

    s.prop1();
    s.prop2();
    s.prop3();
    s.prop4();

    layer = s;
  }

  const end = layer;

  expect(end.prop1()).toBe(expectedBefore[0]);
  expect(end.prop2()).toBe(expectedBefore[1]);
  expect(end.prop3()).toBe(expectedBefore[2]);
  expect(end.prop4()).toBe(expectedBefore[3]);

  batch(() => {
    start.prop1.set(4);
    start.prop2.set(3);
    start.prop3.set(2);
    start.prop4.set(1);
  });

  expect(end.prop1()).toBe(expectedAfter[0]);
  expect(end.prop2()).toBe(expectedAfter[1]);
  expect(end.prop3()).toBe(expectedAfter[2]);
  expect(end.prop4()).toBe(expectedAfter[3]);
};

type BenchmarkResults = [
  readonly [number, number, number, number],
  readonly [number, number, number, number],
];

const expected: Record<number, BenchmarkResults> = {
  1000: [
    [-3, -6, -2, 2],
    [-2, -4, 2, 3],
  ],
  2500: [
    [-3, -6, -2, 2],
    [-2, -4, 2, 3],
  ],
  5000: [
    [2, 4, -1, -6],
    [-2, 1, -4, -4],
  ],
};

for (const layers in expected) {
  const params = expected[layers];
  bench(`cellx${layers}`, () => cellx(+layers, params[0], params[1]), { throws: true, setup });
}
