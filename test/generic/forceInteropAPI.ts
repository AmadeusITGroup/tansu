import { type Consumer, setActiveConsumer, type Signal } from '../../src/interop';
import { type ReactiveFramework } from '../adapters/type';

const wrappedWeakMap = new WeakMap<Signal, Signal>();
export const forceInteropAPIWrapper =
  <T>(fn: () => T) =>
  (): T => {
    const thisConsumer: Consumer = {
      addProducer(signal) {
        let wrapped = wrappedWeakMap.get(signal);
        if (!wrapped) {
          wrapped = {
            watchSignal: signal.watchSignal.bind(signal),
          };
          wrappedWeakMap.set(signal, wrapped);
        }
        consumer?.addProducer(wrapped);
      },
    };
    const consumer = setActiveConsumer(thisConsumer);
    try {
      return fn();
    } finally {
      setActiveConsumer(consumer);
    }
  };

export const wrapAdapterWithForceInteropAPI = (
  baseFramework: ReactiveFramework
): ReactiveFramework => {
  if (baseFramework.interop !== true) {
    throw new Error('incompatible framework');
  }
  return {
    ...baseFramework,
    signal: (initialValue) => {
      const signal = baseFramework.signal(initialValue);
      return {
        read: forceInteropAPIWrapper(signal.read),
        write: signal.write,
      };
    },
    computed: (fn) => baseFramework.computed(forceInteropAPIWrapper(fn)),
    effect: (fn) => baseFramework.effect(forceInteropAPIWrapper(fn)),
    name: `forceInteropAPI(${baseFramework.name})`,
  };
};
