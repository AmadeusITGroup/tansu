// adapted from https://github.com/milomg/js-reactivity-benchmark/blob/main/src/sBench.ts

import { bench } from 'vitest';
import type { ReadableSignal, WritableSignal } from '../../src';
import { computed, writable } from '../../src';
import { setup } from '../gc';

// Inspired by https://github.com/solidjs/solid/blob/main/packages/solid/bench/bench.cjs

const COUNT = 1e4;

type Reader = () => number;

defineBench(onlyCreateDataSignals, COUNT, COUNT);
defineBench(createComputations0to1, COUNT, 0);
defineBench(createComputations1to1, COUNT, COUNT);
defineBench(createComputations2to1, COUNT / 2, COUNT);
defineBench(createComputations4to1, COUNT / 4, COUNT);
defineBench(createComputations1000to1, COUNT / 1000, COUNT);
// createTotal += bench(createComputations8to1, COUNT, 8 * COUNT);
defineBench(createComputations1to2, COUNT, COUNT / 2);
defineBench(createComputations1to4, COUNT, COUNT / 4);
defineBench(createComputations1to8, COUNT, COUNT / 8);
defineBench(createComputations1to1000, COUNT, COUNT / 1000);
defineBench(updateComputations1to1, COUNT * 4, 1);
defineBench(updateComputations2to1, COUNT * 2, 2);
defineBench(updateComputations4to1, COUNT, 4);
defineBench(updateComputations1000to1, COUNT / 100, 1000);
defineBench(updateComputations1to2, COUNT * 4, 1);
defineBench(updateComputations1to4, COUNT * 4, 1);
defineBench(updateComputations1to1000, COUNT * 4, 1);

function defineBench(fn: (n: number, sources: any[]) => void, n: number, scount: number) {
  bench(fn.name, () => fn(n, createDataSignals(scount, [])), { throws: true, setup });
}

function onlyCreateDataSignals() {
  // createDataSignals is already called before
}

function createDataSignals(n: number, sources: ReadableSignal<number>[]) {
  for (let i = 0; i < n; i++) {
    sources[i] = writable(i);
  }
  return sources;
}

function createComputations0to1(n: number /*, _sources: ReadableSignal<number>[]*/) {
  for (let i = 0; i < n; i++) {
    createComputation0(i);
  }
}

function createComputations1to1000(n: number, sources: ReadableSignal<number>[]) {
  for (let i = 0; i < n / 1000; i++) {
    const get = sources[i];
    for (let j = 0; j < 1000; j++) {
      createComputation1(get);
    }
  }
}

function createComputations1to8(n: number, sources: ReadableSignal<number>[]) {
  for (let i = 0; i < n / 8; i++) {
    const get = sources[i];
    createComputation1(get);
    createComputation1(get);
    createComputation1(get);
    createComputation1(get);
    createComputation1(get);
    createComputation1(get);
    createComputation1(get);
    createComputation1(get);
  }
}

function createComputations1to4(n: number, sources: ReadableSignal<number>[]) {
  for (let i = 0; i < n / 4; i++) {
    const get = sources[i];
    createComputation1(get);
    createComputation1(get);
    createComputation1(get);
    createComputation1(get);
  }
}

function createComputations1to2(n: number, sources: ReadableSignal<number>[]) {
  for (let i = 0; i < n / 2; i++) {
    const get = sources[i];
    createComputation1(get);
    createComputation1(get);
  }
}

function createComputations1to1(n: number, sources: ReadableSignal<number>[]) {
  for (let i = 0; i < n; i++) {
    const get = sources[i];
    createComputation1(get);
  }
}

function createComputations2to1(n: number, sources: ReadableSignal<number>[]) {
  for (let i = 0; i < n; i++) {
    createComputation2(sources[i * 2], sources[i * 2 + 1]);
  }
}

function createComputations4to1(n: number, sources: ReadableSignal<number>[]) {
  for (let i = 0; i < n; i++) {
    createComputation4(sources[i * 4], sources[i * 4 + 1], sources[i * 4 + 2], sources[i * 4 + 3]);
  }
}

// function createComputations8to1(n: number, sources: ReadableSignal<number>[]) {
//   for (let i = 0; i < n; i++) {
//     createComputation8(
//       sources[i * 8],
//       sources[i * 8 + 1],
//       sources[i * 8 + 2],
//       sources[i * 8 + 3],
//       sources[i * 8 + 4],
//       sources[i * 8 + 5],
//       sources[i * 8 + 6],
//       sources[i * 8 + 7]
//     );
//   }
// }

// only create n / 100 computations, as otherwise takes too long
function createComputations1000to1(n: number, sources: ReadableSignal<number>[]) {
  for (let i = 0; i < n; i++) {
    createComputation1000(sources, i * 1000);
  }
}

function createComputation0(i: number) {
  computed(() => i).subscribe(() => {});
}

function createComputation1(s1: Reader) {
  computed(() => s1()).subscribe(() => {});
}
function createComputation2(s1: Reader, s2: Reader) {
  computed(() => s1() + s2()).subscribe(() => {});
}

function createComputation4(s1: Reader, s2: Reader, s3: Reader, s4: Reader) {
  computed(() => s1() + s2() + s3() + s4()).subscribe(() => {});
}

// function createComputation8(
//   s1: Reader,
//   s2: Reader,
//   s3: Reader,
//   s4: Reader,
//   s5: Reader,
//   s6: Reader,
//   s7: Reader,
//   s8: Reader
// ) {
//   computed(
//     () => s1() + s2() + s3() + s4() + s5() + s6() + s7() + s8()
//   );
// }

function createComputation1000(ss: ReadableSignal<number>[], offset: number) {
  computed(() => {
    let sum = 0;
    for (let i = 0; i < 1000; i++) {
      sum += ss[offset + i]();
    }
    return sum;
  }).subscribe(() => {});
}

function updateComputations1to1(n: number, sources: WritableSignal<number>[]) {
  const get1 = sources[0];
  const set1 = get1.set;
  computed(() => get1()).subscribe(() => {});
  for (let i = 0; i < n; i++) {
    set1(i);
  }
}

function updateComputations2to1(n: number, sources: WritableSignal<number>[]) {
  const get1 = sources[0],
    set1 = get1.set,
    get2 = sources[1];
  computed(() => get1() + get2()).subscribe(() => {});
  for (let i = 0; i < n; i++) {
    set1(i);
  }
}

function updateComputations4to1(n: number, sources: WritableSignal<number>[]) {
  const get1 = sources[0],
    set1 = get1.set,
    get2 = sources[1],
    get3 = sources[2],
    get4 = sources[3];
  computed(() => get1() + get2() + get3() + get4()).subscribe(() => {});
  for (let i = 0; i < n; i++) {
    set1(i);
  }
}

function updateComputations1000to1(n: number, sources: WritableSignal<number>[]) {
  const { set: set1 } = sources[0];
  computed(() => {
    let sum = 0;
    for (let i = 0; i < 1000; i++) {
      sum += sources[i]();
    }
    return sum;
  }).subscribe(() => {});
  for (let i = 0; i < n; i++) {
    set1(i);
  }
}

function updateComputations1to2(n: number, sources: WritableSignal<number>[]) {
  const get1 = sources[0];
  const set1 = get1.set;
  computed(() => get1()).subscribe(() => {});
  computed(() => get1()).subscribe(() => {});
  for (let i = 0; i < n / 2; i++) {
    set1(i);
  }
}

function updateComputations1to4(n: number, sources: WritableSignal<number>[]) {
  const get1 = sources[0];
  const set1 = get1.set;
  computed(() => get1()).subscribe(() => {});
  computed(() => get1()).subscribe(() => {});
  computed(() => get1()).subscribe(() => {});
  computed(() => get1()).subscribe(() => {});
  for (let i = 0; i < n / 4; i++) {
    set1(i);
  }
}

function updateComputations1to1000(n: number, sources: WritableSignal<number>[]) {
  const get1 = sources[0];
  const set1 = get1.set;
  for (let i = 0; i < 1000; i++) {
    computed(() => get1()).subscribe(() => {});
  }
  for (let i = 0; i < n / 1000; i++) {
    set1(i);
  }
}
