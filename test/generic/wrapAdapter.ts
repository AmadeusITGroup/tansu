import { mergeWithFn, type ReactiveFramework } from '../adapters/type';

export const wrapAdapterWithComputed = (
  baseFramework: ReactiveFramework,
  wrapper: Pick<ReactiveFramework, 'computed' | 'name' | 'withBuild' | 'withBatch' | 'interop'>
): ReactiveFramework => {
  if (baseFramework.interop !== wrapper.interop) {
    throw new Error('incompatible frameworks');
  }
  return {
    name: `wrapWithComputed(${baseFramework.name},${wrapper.name})`,
    interop: baseFramework.interop,
    signal: (initialValue) => {
      const signal = baseFramework.signal(initialValue);
      return {
        read: wrapper.computed(signal.read).read,
        write: signal.write,
      };
    },
    computed: (fn) => wrapper.computed(baseFramework.computed(fn).read),
    effect: baseFramework.effect,
    withBatch: mergeWithFn(baseFramework.withBatch, wrapper.withBatch),
    withBuild: mergeWithFn(baseFramework.withBuild, wrapper.withBuild),
  };
};
