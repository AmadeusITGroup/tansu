import { noopWithBuild, type ReactiveFramework } from './type';
import { writable, computed, batch } from '../../src/index';

export const tansuFramework: ReactiveFramework = {
  name: 'tansu',
  interop: true,
  signal: (initialValue) => {
    const w = writable(initialValue);
    return {
      write: w.set,
      read: w,
    };
  },
  computed: (fn) => {
    return {
      read: computed(fn),
    };
  },
  effect: (fn) => computed(fn).subscribe(() => {}),
  withBatch: batch,
  withBuild: noopWithBuild,
};
