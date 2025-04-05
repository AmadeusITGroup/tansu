import { createQueue } from './linkedQueue';
import type { SubscribeConsumer } from './subscribeConsumer';

let willProcessQueue = false;
const { add, remove, shift } = createQueue<SubscribeConsumer<any, any>>();

export { add as addToQueue, remove as removeFromQueue };

/**
 * Batches multiple changes to stores while calling the provided function,
 * preventing derived stores from updating until the function returns,
 * to avoid unnecessary recomputations.
 *
 * @remarks
 *
 * If a store is updated multiple times in the provided function, existing
 * subscribers of that store will only be called once when the provided
 * function returns.
 *
 * Note that even though the computation of derived stores is delayed in most
 * cases, some computations of derived stores will still occur inside
 * the function provided to batch if a new subscriber is added to a store, because
 * calling {@link SubscribableStore.subscribe | subscribe} always triggers a
 * synchronous call of the subscriber and because tansu always provides up-to-date
 * values when calling subscribers. Especially, calling {@link get} on a store will
 * always return the correct up-to-date value and can trigger derived store
 * intermediate computations, even inside batch.
 *
 * It is possible to have nested calls of batch, in which case only the first
 * (outer) call has an effect, inner calls only call the provided function.
 *
 * @param fn - a function that can update stores. Its returned value is
 * returned by the batch function.
 *
 * @example
 * Using batch in the following example prevents logging the intermediate "Sherlock Lupin" value.
 *
 * ```typescript
 * const firstName = writable('Arsène');
 * const lastName = writable('Lupin');
 * const fullName = derived([firstName, lastName], ([a, b]) => `${a} ${b}`);
 * fullName.subscribe((name) => console.log(name)); // logs any change to fullName
 * batch(() => {
 *     firstName.set('Sherlock');
 *     lastName.set('Holmes');
 * });
 * ```
 */
export const batch = <T>(fn: () => T): T => {
  const needsProcessQueue = !willProcessQueue;
  willProcessQueue = true;
  let success = true;
  let res;
  let error;
  try {
    res = fn();
  } finally {
    if (needsProcessQueue) {
      let consumer = shift();
      while (consumer) {
        try {
          consumer.notify();
        } catch (e) {
          // an error in one consumer should not impact others
          if (success) {
            // will throw the first error
            success = false;
            error = e;
          }
        }
        consumer = shift();
      }
      willProcessQueue = false;
    }
  }
  if (success) {
    return res;
  }
  throw error;
};
