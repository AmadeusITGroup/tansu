import { setActiveConsumer } from '../interop';

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
