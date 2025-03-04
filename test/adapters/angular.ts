import { computed, signal } from '@angular/core';
import { createWatch } from '@angular/core/primitives/signals';
import { noopWithBuild, type ReactiveFramework } from './type';
import { afterBatch } from '../../src/interop';
import { batch } from './simple';

export const angularFramework: ReactiveFramework = {
  name: 'angular',
  interop: 'angular',
  signal: (initialValue) => {
    const s = signal(initialValue);
    return {
      write: (v) => s.set(v),
      read: () => s(),
    };
  },
  computed: (fn) => {
    const c = computed(fn);
    return {
      read: () => c(),
    };
  },
  effect,
  withBatch: batch,
  withBuild: noopWithBuild,
};

function effect(effectFn: () => void): () => void {
  let scheduled = false;
  let alive = true;
  const fn = () => {
    scheduled = false;
    if (alive) {
      w.run();
    }
  };
  const w = createWatch(
    effectFn,
    () => {
      if (!scheduled && alive) {
        scheduled = true;
        afterBatch(fn);
      }
    },
    true
  );
  w.run();
  return () => {
    alive = false;
    w.destroy();
  };
}
