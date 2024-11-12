import type { BaseLink, RawStore } from './store';

export interface ActiveConsumer {
  addProducer: <T, L extends BaseLink<T>>(store: RawStore<T, L>) => T;
}

export let activeConsumer: ActiveConsumer | null = null;

export const setActiveConsumer = (consumer: ActiveConsumer | null): ActiveConsumer | null => {
  const prevConsumer = activeConsumer;
  activeConsumer = consumer;
  return prevConsumer;
};

/**
 * Stops the tracking of dependencies made by {@link computed} and calls the provided function.
 * After the function returns, the tracking of dependencies continues as before.
 *
 * @param fn - function to be called
 * @returns the value returned by the given function
 */
export const untrack = <T>(fn: () => T): T => {
  let output: T;
  const prevActiveConsumer = setActiveConsumer(null);
  try {
    output = fn();
  } finally {
    setActiveConsumer(prevActiveConsumer);
  }
  return output;
};
