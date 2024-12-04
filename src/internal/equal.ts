/**
 * Default implementation of the equal function used by tansu when a store
 * changes, to know if listeners need to be notified.
 * Returns false if `a` is a function or an object, or if `a` and `b`
 * are different according to `Object.is`. Otherwise, returns true.
 *
 * @param a - First value to compare.
 * @param b - Second value to compare.
 * @returns true if a and b are considered equal.
 */
export const equal = <T>(a: T, b: T): boolean =>
  Object.is(a, b) && (!a || typeof a !== 'object') && typeof a !== 'function';
