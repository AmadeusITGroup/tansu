import type { ReactiveFramework } from './type';
// @ts-expect-error Cannot find module 'svelte/internal/client' or its corresponding type declarations.
import * as $ from 'svelte/internal/client';

// NOTE: The svelte adapter uses private, internal APIs that are usually only
// used by the Svelte compiler and client runtime. The Svelte team has made the
// decision to not expose these APIs publicly / officially, because it gives
// them more freedom to experiment without making breaking changes, but given
// that Svelte's v5 reactivity API is one of the most actively developed and
// efficient TS implementations available, I wanted to include it in the
// benchmark suite regardless.

export const svelteFramework: ReactiveFramework = {
  name: 'svelte',
  interop: 'svelte',
  signal: (initialValue) => {
    const s = $.state(initialValue);
    return {
      write: (v) => $.set(s, v),
      read: () => $.get(s),
    };
  },
  computed: (fn) => {
    const c = $.derived(fn);
    return {
      read: () => $.get(c),
    };
  },
  effect: (fn) => {
    const enabled = $.state(true);
    $.render_effect(() => {
      if ($.get(enabled)) {
        fn();
      }
    });
    return () => {
      $.set(enabled, false);
    };
  },
  withBatch: $.flush,
  withBuild: <T>(fn: () => T): T => {
    let res: T | undefined;
    $.effect_root(() => {
      res = fn();
    });
    return res!;
  },
};
