/**
 * tansu is a lightweight, push-based state management library.
 * It borrows the ideas and APIs originally designed and implemented by {@link https://github.com/sveltejs/rfcs/blob/master/text/0002-reactive-stores.md | Svelte stores}.
 *
 * @packageDocumentation
 */

import { equal } from './internal/equal';
import {
  exposeRawStore,
  getRawStore,
  rawStoreSymbol,
  symbolObservable,
} from './internal/exposeRawStores';
import { RawStoreComputed } from './internal/storeComputed';
import { RawStoreConst } from './internal/storeConst';
import {
  createOnUseArg,
  RawStoreAsyncDerived,
  RawStoreDerivedStore,
  RawStoreSyncDerived,
} from './internal/storeDerived';
import { RawStoreWithOnUse } from './internal/storeWithOnUse';
import { RawStoreWritable } from './internal/storeWritable';
import { noop } from './internal/subscribeConsumer';
import { untrack } from './internal/untrack';
import type {
  AsyncDeriveFn,
  AsyncDeriveOptions,
  OnUseFn,
  Readable,
  ReadableSignal,
  StoreInput,
  StoreOptions,
  StoresInput,
  StoresInputValues,
  Subscriber,
  SyncDeriveFn,
  SyncDeriveOptions,
  UnsubscribeFunction,
  UnsubscribeObject,
  Unsubscriber,
  Updater,
  Writable,
  WritableSignal,
} from './types';

export { batch } from './internal/batch';
export { equal } from './internal/equal';
export { symbolObservable } from './internal/exposeRawStores';
export { untrack } from './internal/untrack';
export type * from './types';

/**
 * Returns a wrapper (for the given store) which only exposes the {@link ReadableSignal} interface.
 * This converts any {@link StoreInput} to a {@link ReadableSignal} and exposes the store as read-only.
 *
 * @param store - store to wrap
 * @returns A wrapper which only exposes the {@link ReadableSignal} interface.
 */
export function asReadable<T>(store: StoreInput<T>): ReadableSignal<T>;
/**
 * Returns a wrapper (for the given store) which only exposes the {@link ReadableSignal} interface and
 * also adds the given extra properties on the returned object.
 *
 * @param store - store to wrap
 * @param extraProp - extra properties to add on the returned object
 * @returns A wrapper which only exposes the {@link ReadableSignal} interface and the given extra properties.
 */
export function asReadable<T, U>(
  store: StoreInput<T>,
  extraProp: U
): ReadableSignal<T> & Omit<U, keyof Readable<T>>;
export function asReadable<T, U>(
  store: StoreInput<T>,
  extraProp?: U
): ReadableSignal<T> & Omit<U, keyof Readable<T>> {
  return exposeRawStore(getRawStore(store), extraProp);
}

const defaultUpdate: any = function <T, U>(this: Writable<T, U>, updater: Updater<T, U>) {
  this.set(updater(untrack(() => this.get())));
};

/**
 * Returns a wrapper (for the given store) which only exposes the {@link WritableSignal} interface.
 * When the value is changed from the given wrapper, the provided set function is called.
 *
 * @param store - store to wrap
 * @param set - function that will be called when the value is changed from the wrapper
 * (through the {@link Writable.set|set} or the {@link Writable.update|update} function).
 * If set is not specified, a noop function is used (so the value of the store cannot be changed
 * from the returned wrapper).
 * @returns A wrapper which only exposes the {@link WritableSignal} interface.
 */
export function asWritable<T, W = T>(
  store: StoreInput<T>,
  set?: WritableSignal<T, W>['set']
): WritableSignal<T, W>;
/**
 * Returns a wrapper (for the given store) which only exposes the {@link WritableSignal} interface and
 * also adds the given extra properties on the returned object.
 *
 * @param store - store to wrap
 * @param extraProps - object containing the extra properties to add on the returned object,
 * and optionally the {@link Writable.set|set} and the {@link Writable.update|update} function of the
 * {@link WritableSignal} interface.
 * If the set function is not specified, a noop function is used.
 *
 * If the update function is not specified, a default function that calls set is used.
 * @returns A wrapper which only exposes the {@link WritableSignal} interface and the given extra properties.
 */
export function asWritable<T, U, W = T>(
  store: StoreInput<T>,
  extraProps: U & Partial<Pick<WritableSignal<T, W>, 'set' | 'update'>>
): WritableSignal<T, W> & Omit<U, keyof WritableSignal<T, W>>;
export function asWritable<T, U, W = T>(
  store: StoreInput<T>,
  setOrExtraProps?:
    | WritableSignal<T, W>['set']
    | (U & Partial<Pick<WritableSignal<T, W>, 'set' | 'update'>>)
): WritableSignal<T, W> & Omit<U, keyof WritableSignal<T, W>> {
  return asReadable(
    store,
    typeof setOrExtraProps === 'function'
      ? { set: setOrExtraProps, update: defaultUpdate }
      : {
          ...setOrExtraProps,
          set: setOrExtraProps?.set ?? noop,
          update: setOrExtraProps?.update ?? (setOrExtraProps?.set ? defaultUpdate : noop),
        }
  ) as any;
}

/**
 * A utility function to get the current value from a given store.
 * It works by subscribing to a store, capturing the value (synchronously) and unsubscribing just after.
 *
 * @param store - a store from which the current value is retrieved.
 *
 * @example
 * ```typescript
 * const myStore = writable(1);
 * console.log(get(myStore)); // logs 1
 * ```
 */
export const get = <T>(store: StoreInput<T>): T => getRawStore(store).get();

/**
 * Base class that can be extended to easily create a custom {@link Readable} store.
 *
 * @example
 * ```typescript
 * class CounterStore extends Store {
 *    constructor() {
 *      super(1); // initial value
 *    }
 *
 *    reset() {
 *      this.set(0);
 *    }
 *
 *    increment() {
 *      this.update(value => value + 1);
 *    }
 * }
 *
 * const store = new CounterStore(1);
 *
 * // logs 1 (initial value) upon subscription
 * const unsubscribe = store.subscribe((value) => {
 *    console.log(value);
 * });
 * store.increment(); // logs 2
 * store.reset(); // logs 0
 *
 * unsubscribe(); // stops notifications and corresponding logging
 * ```
 */
export abstract class Store<T> implements Readable<T> {
  /**
   *
   * @param value - Initial value of the store
   */
  constructor(value: T) {
    let rawStore;
    if (value instanceof RawStoreWritable) {
      rawStore = value;
    } else {
      const onUse = this.onUse;
      rawStore = onUse
        ? new RawStoreWithOnUse(value, onUse.bind(this))
        : new RawStoreWritable(value);
      rawStore.equalFn = (a, b) => this.equal(a, b);
    }
    this[rawStoreSymbol] = rawStore;
  }

  /** @internal */
  [rawStoreSymbol]: RawStoreWritable<T>;

  /**
   * Compares two values and returns true if they are equal.
   * It is called when setting a new value to avoid doing anything
   * (such as notifying subscribers) if the value did not change.
   * The default logic is to return false if `a` is a function or an object,
   * or if `a` and `b` are different according to `Object.is`.
   * This method can be overridden by subclasses to change the logic.
   *
   * @remarks
   * For backward compatibility, the default implementation calls the
   * deprecated {@link Store.notEqual} method and returns the negation
   * of its return value.
   *
   * @param a - First value to compare.
   * @param b - Second value to compare.
   * @returns true if a and b are considered equal.
   */
  protected equal(a: T, b: T): boolean {
    return !this.notEqual(a, b);
  }

  /**
   * Compares two values and returns true if they are different.
   * It is called when setting a new value to avoid doing anything
   * (such as notifying subscribers) if the value did not change.
   * The default logic is to return true if `a` is a function or an object,
   * or if `a` and `b` are different according to `Object.is`.
   * This method can be overridden by subclasses to change the logic.
   *
   * @remarks
   * This method is only called by the default implementation of
   * {@link Store.equal}, so overriding {@link Store.equal} takes
   * precedence over overriding notEqual.
   *
   * @deprecated Use {@link Store.equal} instead
   * @param a - First value to compare.
   * @param b - Second value to compare.
   * @returns true if a and b are considered different.
   */
  protected notEqual(a: T, b: T): boolean {
    return !equal(a, b);
  }

  /**
   * Replaces store's state with the provided value.
   * Equivalent of {@link Writable.set}, but internal to the store.
   *
   * @param value - value to be used as the new state of a store.
   */
  protected set(value: T): void {
    this[rawStoreSymbol].set(value);
  }

  get(): T {
    return this[rawStoreSymbol].get();
  }

  /**
   * Updates store's state by using an {@link Updater} function.
   * Equivalent of {@link Writable.update}, but internal to the store.
   *
   * @param updater - a function that takes the current state as an argument and returns the new state.
   */
  protected update(updater: Updater<T>): void {
    this[rawStoreSymbol].update(updater);
  }

  /**
   * Function called when the number of subscribers changes from 0 to 1
   * (but not called when the number of subscribers changes from 1 to 2, ...).
   * If a function is returned, it will be called when the number of subscribers changes from 1 to 0.
   *
   * @example
   *
   * ```typescript
   * class CustomStore extends Store {
   *    onUse() {
   *      console.log('Got the fist subscriber!');
   *      return () => {
   *        console.log('All subscribers are gone...');
   *      };
   *    }
   * }
   *
   * const store = new CustomStore();
   * const unsubscribe1 = store.subscribe(() => {}); // logs 'Got the fist subscriber!'
   * const unsubscribe2 = store.subscribe(() => {}); // nothing is logged as we've got one subscriber already
   * unsubscribe1(); // nothing is logged as we still have one subscriber
   * unsubscribe2(); // logs 'All subscribers are gone...'
   * ```
   */
  protected onUse?(): Unsubscriber | void;

  /**
   * Default Implementation of the {@link SubscribableStore.subscribe}, not meant to be overridden.
   * @param subscriber - see {@link SubscribableStore.subscribe}
   */
  subscribe(subscriber: Subscriber<T>): UnsubscribeFunction & UnsubscribeObject {
    return this[rawStoreSymbol].subscribe(subscriber);
  }

  [symbolObservable](): this {
    return this;
  }
}

const createStoreWithOnUse = <T>(initValue: T, onUse: OnUseFn<T>) => {
  const store: RawStoreWithOnUse<T> = new RawStoreWithOnUse(initValue, () => onUse(setFn));
  const setFn = createOnUseArg(store);
  return store;
};

const applyStoreOptions = <T, S extends RawStoreWritable<T>>(
  store: S,
  options?: Omit<StoreOptions<T>, 'onUse'>
): S => {
  if (options) {
    const { equal, notEqual } = options;
    if (equal) {
      store.equalFn = equal;
    } else if (notEqual) {
      store.equalFn = (a: T, b: T) => !notEqual(a, b);
    }
  }
  return store;
};

/**
 * A convenience function to create {@link Readable} store instances.
 * @param value - Initial value of a readable store.
 * @param options - Either an object with {@link StoreOptions | store options}, or directly the onUse function.
 *
 * The onUse function is a function called when the number of subscribers changes from 0 to 1
 * (but not called when the number of subscribers changes from 1 to 2, ...).
 *
 * If a function is returned, it will be called when the number of subscribers changes from 1 to 0.
 *
 * @example Sample with an onUse function
 * ```typescript
 * const clock = readable("00:00", setState => {
 *   const intervalID = setInterval(() => {
 *     const date = new Date();
 *     setState(`${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`);
 *   }, 1000);
 *
 *   return () => clearInterval(intervalID);
 * });
 * ```
 */
export function readable<T>(value: T, options?: StoreOptions<T> | OnUseFn<T>): ReadableSignal<T> {
  if (typeof options === 'function') {
    options = { onUse: options };
  }
  const onUse = options?.onUse;
  return exposeRawStore(
    onUse
      ? applyStoreOptions(createStoreWithOnUse(value, onUse), options)
      : new RawStoreConst(value)
  );
}

/**
 * A convenience function to create {@link Writable} store instances.
 * @param value - initial value of a new writable store.
 * @param options - Either an object with {@link StoreOptions | store options}, or directly the onUse function.
 *
 * The onUse function is a function called when the number of subscribers changes from 0 to 1
 * (but not called when the number of subscribers changes from 1 to 2, ...).
 *
 * If a function is returned, it will be called when the number of subscribers changes from 1 to 0.
 *
 * @example
 * ```typescript
 * const x = writable(0);
 *
 * x.update(v => v + 1); // increment
 * x.set(0); // reset back to the default value
 * ```
 */
export function writable<T>(value: T, options?: StoreOptions<T> | OnUseFn<T>): WritableSignal<T> {
  if (typeof options === 'function') {
    options = { onUse: options };
  }
  const onUse = options?.onUse;
  const store = applyStoreOptions(
    onUse ? createStoreWithOnUse(value, onUse) : new RawStoreWritable(value),
    options
  );
  const res = exposeRawStore(store) as any;
  res.set = store.set.bind(store);
  res.update = store.update.bind(store);
  return res;
}

type DeriveFn<T, S> = SyncDeriveFn<T, S> | AsyncDeriveFn<T, S>;
interface DeriveOptions<T, S> extends Omit<StoreOptions<T>, 'onUse'> {
  derive: DeriveFn<T, S>;
}
function isSyncDeriveFn<T, S>(fn: DeriveFn<T, S>): fn is SyncDeriveFn<T, S> {
  return fn.length <= 1;
}

export abstract class DerivedStore<T, S extends StoresInput = StoresInput> extends Store<T> {
  constructor(stores: S, initialValue: T) {
    const rawStore = new RawStoreDerivedStore(stores, initialValue, (values) =>
      this.derive(values)
    );
    rawStore.equalFn = (a, b) => this.equal(a, b);
    super(rawStore as any);
  }
  protected abstract derive(values: StoresInputValues<S>): Unsubscriber | void;
}

/**
 * A convenience function to create a new store with a state computed from the latest values of dependent stores.
 * Each time the state of one of the dependent stores changes, a provided derive function is called to compute a new, derived state.
 *
 * @param stores - a single store or an array of dependent stores
 * @param options - either an object with store options, including a derive function, or the derive function itself directly.
 * The derive function is used to compute a new state based on the latest values of dependent stores.
 *
 * Alternatively, this function can accept a second argument, `set`, to manage asynchronous values.
 * If you return a function from the callback, it will be called when the callback runs again, or the last subscriber unsubscribes.
 *
 * @example synchronous
 * ```typescript
 * const x$ = writable(2);
 * const y$ = writable(3);
 * const sum$ = derived([x$, y$], ([x, y]) => x + y);
 *
 * // will log 5 upon subscription
 * sum$.subscribe((value) => {
 *    console.log(value)
 * });
 *
 * x$.set(3); // will re-evaluate the `([x, y]) => x + y` function and log 6 as this is the new state of the derived store
 *
 * ```
 *
 *  @example asynchronous
 * ```typescript
 * const x$ = writable(2);
 * const y$ = writable(3);
 *
 * const sum$ = derived([x$, $y], ([x, y], set) => {
 *    const timeoutId = setTimeout(() => set(x + y)));
 *    return () => clearTimeout(timeoutId);
 * }, <number>undefined);
 *
 * // will log undefined (the default value), then 5 asynchronously
 * sum$.subscribe((value) => {
 *    console.log(value)
 * });
 *
 * ```

 */
export function derived<T, S extends StoresInput>(
  stores: S,
  options: AsyncDeriveFn<T, S> | AsyncDeriveOptions<T, S>,
  initialValue: T
): ReadableSignal<T>;
export function derived<T, S extends StoresInput>(
  stores: S,
  options: SyncDeriveFn<T, S> | SyncDeriveOptions<T, S>,
  initialValue?: T
): ReadableSignal<T>;
export function derived<T, S extends StoresInput>(
  stores: S,
  options: DeriveFn<T, S> | DeriveOptions<T, S>,
  initialValue?: T
): ReadableSignal<T> {
  if (typeof options === 'function') {
    options = { derive: options };
  }
  const { derive, ...opts } = options;
  const Derived = isSyncDeriveFn(derive) ? RawStoreSyncDerived : RawStoreAsyncDerived;
  return exposeRawStore(
    applyStoreOptions(new Derived(stores as any, initialValue as any, derive as any), opts)
  );
}

/**
 * Creates a store whose value is computed by the provided function.
 *
 * @remarks
 *
 * The computation function is first called the first time the store is used.
 *
 * It can use the value of other stores or observables and the computation function is called again if the value of those dependencies
 * changed, as long as the store is still used.
 *
 * Dependencies are detected automatically as the computation function gets their value either by calling the stores
 * as a function (as it is possible with stores implementing {@link ReadableSignal}), or by calling the {@link get} function
 * (with a store or any observable). If some calls made by the function should not be tracked as dependencies, it is possible
 * to wrap them in a call to {@link untrack}.
 *
 * Note that dependencies can change between calls of the computation function. Internally, tansu will subscribe to new dependencies
 * when they are used and unsubscribe from dependencies that are no longer used after the call of the computation function.
 *
 * @param fn - computation function that returns the value of the store
 * @param options - store option. Allows to define the {@link StoreOptions.equal|equal} function, if needed
 * @returns store containing the value returned by the computation function
 */
export function computed<T>(
  fn: () => T,
  options?: Omit<StoreOptions<T>, 'onUse'>
): ReadableSignal<T> {
  return exposeRawStore(applyStoreOptions(new RawStoreComputed(fn), options));
}
