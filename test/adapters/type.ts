// Based on https://github.com/milomg/js-reactivity-benchmark/blob/d774a141d2b3c741ba6972de7f3bcc2b8c60de06/src/util/reactiveFramework.ts

export interface ReactiveFramework {
  name: string;
  interop: true | string;
  signal<T>(initialValue: T): Signal<T>;
  computed<T>(fn: () => T): Computed<T>;
  effect(fn: () => void): () => void;
  withBatch<T>(fn: () => T): T;
  withBuild<T>(fn: () => T): T;
}

export interface Signal<T> {
  read(): T;
  write(v: T): void;
}

export interface Computed<T> {
  read(): T;
}

export const noopWithBuild = <T>(fn: () => T): T => fn();
const merge2WithFn = (
  fn1: <T>(fn: () => T) => T,
  fn2: <T>(fn: () => T) => T
): (<T>(fn: () => T) => T) => {
  if (fn1 === fn2) return fn1;
  if (fn1 === noopWithBuild) return fn2;
  if (fn2 === noopWithBuild) return fn1;
  return (fn) => fn1(() => fn2(fn));
};
export const mergeWithFn = (...fns: Array<<T>(fn: () => T) => T>): (<T>(fn: () => T) => T) =>
  fns.reduce(merge2WithFn);
