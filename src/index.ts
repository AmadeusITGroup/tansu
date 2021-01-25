import { Injectable, OnDestroy } from '@angular/core';

const symbolObservable = (typeof Symbol === 'function' && Symbol.observable) || '@@observable';

/** Callback to inform of a value updates. */
type SubscriberFunction<T> = (value: T) => void;

interface SubscriberObject<T> {
  next: SubscriberFunction<T>;
  invalidate: () => void;
}

type Subscriber<T> = SubscriberFunction<T> | Partial<SubscriberObject<T>> | null | undefined;

/** Unsubscribes from value updates. */
type UnsubscribeFunction = () => void;

interface UnsubscribeObject {
  unsubscribe: UnsubscribeFunction;
}
type Unsubscriber = UnsubscribeObject | UnsubscribeFunction;

/** Callback to update a value. */
type Updater<T> = (value: T) => T;

export interface SubscribableStore<T> {
  subscribe(subscriber: Subscriber<T>): Unsubscriber;
}

export interface Readable<T> extends SubscribableStore<T>, OnDestroy {
  subscribe(subscriber: Subscriber<T>): UnsubscribeFunction & UnsubscribeObject;
}

export interface Writable<T> extends Readable<T> {
  set(value: T): void;
  update(updater: Updater<T>): void;
}

const noop = () => {};

const bind = <T>(object: T | null | undefined, fnName: keyof T) => {
  const fn = object ? object[fnName] : null;
  return typeof fn === 'function' ? fn.bind(object) : noop;
};

const toSubscriberObject = <T>(subscriber: Subscriber<T>): SubscriberObject<T> =>
  typeof subscriber === 'function'
    ? { next: subscriber.bind(null), invalidate: noop }
    : { next: bind(subscriber, 'next'), invalidate: bind(subscriber, 'invalidate') };

const returnThis = function <T>(this: T): T {
  return this;
};

const asReadable = <T>(store: Store<T>): Readable<T> => ({
  subscribe: store.subscribe.bind(store),
  ngOnDestroy: store.ngOnDestroy.bind(store),
  [symbolObservable]: returnThis,
});

const queue: [SubscriberFunction<any>, any][] = [];

function processQueue() {
  for (const [subscriberFn, value] of queue) {
    subscriberFn(value);
  }
  queue.length = 0;
}

const callUnsubscribe = (unsubscribe: Unsubscriber) =>
  typeof unsubscribe === 'function' ? unsubscribe() : unsubscribe.unsubscribe();

function notEqual(a: any, b: any): boolean {
  const tOfA = typeof a;
  if (tOfA !== 'function' && tOfA !== 'object') {
    return !Object.is(a, b);
  }
  return true;
}

/**
 *
 * @param store - Get the current value from a store
 * @example
 * ```typescript
 * const myStore = writable(1);
 * get(myStore); // returns 1
 * ```
 */
export function get<T>(store: SubscribableStore<T>): T {
  let value: T;
  callUnsubscribe(store.subscribe((v) => (value = v)));
  return value!;
}

/**
 *
 * Base class of a store, from which all application store can inherit to create custom stores and manage reactive data
 *
 * @example
 * ```typescript
 * class CounterStore extends Store {
 *    setCounter(value) {
 *      this.set(value)
 *    }
 *
 *    increment() {
 *      this.update((value) => value + 1);
 *    }
 *
 *    decrement() {
 *      this.update((value) => value - 1);
 *    }
 * }
 *
 * const store = CounterStore(1);
 *
 * // Output 1, as it's the initial value
 * const unsubscribe = store.subscribe((value) => {
 *    // Subscriber function called each time the store data changes
 *    console.log('Store value', value);
 * });
 * store.setCounter(2); // Output 2
 * store.increment(); // Output 3
 *
 * unsubscribe(); // Stop subscription
 * ```
 */
@Injectable()
export abstract class Store<T> implements Readable<T> {
  private _subscribers = new Set<SubscriberObject<T>>();
  private _cleanupFn: null | Unsubscriber = null;

  /**
   *
   * @param _value - Initial value of the store
   */
  constructor(private _value: T) {}

  private _start() {
    this._cleanupFn = this.onUse() || noop;
  }

  private _stop() {
    const cleanupFn = this._cleanupFn;
    if (cleanupFn) {
      this._cleanupFn = null;
      callUnsubscribe(cleanupFn);
    }
  }

  /**
   * Set a new value in the store.
   * If the value is an object, or if the value is a primitive and has changed, all the subscribers will be called.
   *
   * @param value - The new store value
   *
   */
  protected set(value: T): void {
    if (notEqual(this._value, value)) {
      this._value = value;
      if (!this._cleanupFn) {
        // subscriber not yet initialized
        return;
      }
      const needsProcessQueue = queue.length == 0;
      for (const subscriber of this._subscribers) {
        subscriber.invalidate();
        queue.push([subscriber.next, value]);
      }
      if (needsProcessQueue) {
        processQueue();
      }
    }
  }

  /**
   * Allow to update the store value
   * @param updater - Function called with the current value of the store. It must return the new store value.
   *
   * @example
   * ```typescript
   * // With a custom api
   * class CounterStore extends Store {
   *    increment() {
   *      this.update((counter) => counter + 1)
   *    }
   * }
   *
   * const counterStore = new CounterStore(0);
   * counterStore.increment();
   * ```
   *
   * @example
   * ```typescript
   * // Generic store which exposes 'update', but keep 'set' private
   * class CounterStore extends Store {
   *    public update(fn) {
   *      super.update(fn);
   *    }
   * }
   *
   * const counterStore = new CounterStore(0);
   * counterStore.update((counter) => counter + 1);
   * ```
   *
   */
  protected update(updater: Updater<T>): void {
    this.set(updater(this._value));
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
   *      console.log('This store is subscribed');
   *      return () => {
   *        console.log('No more subscriber');
   *      }
   *    }
   * }
   *
   * const store = new CustomStore();
   * const unsubscribe = store.subscribe(() => {}); // Output 'This store is subscribed'
   * unsubscribe(); // Output 'No more subscriber'
   * ```
   */
  protected onUse(): Unsubscriber | void {}

  /**
   *
   * @param subscriber - Function synchronously called with the current store value. It is called each time the store changes.
   * It returns an unsubscribe object to stop the subscription
   *
   * @example
   *
   * ```typescript
   * const myStore = new WritableStore(1)
   * const unsubscribe = myStore.subscribe((storeValue) => {
   *    console.log(storeValue); // output 1 in the console.
   * });
   *
   * myStore.set(2) // output 2 in the console.
   * unsubscribe();
   * myStore.set(3) // no console output.
   * ```
   *
   */
  subscribe(subscriber: Subscriber<T>): UnsubscribeFunction & UnsubscribeObject {
    const subscriberObject = toSubscriberObject(subscriber);
    this._subscribers.add(subscriberObject);
    if (this._subscribers.size == 1) {
      this._start();
    }
    subscriberObject.next(this._value);

    const unsubscribe = () => {
      const removed = this._subscribers.delete(subscriberObject);
      if (removed && this._subscribers.size === 0) {
        this._stop();
      }
    };
    unsubscribe.unsubscribe = unsubscribe;
    return unsubscribe;
  }

  ngOnDestroy(): void {
    const hasSubscribers = this._subscribers.size > 0;
    this._subscribers.clear();
    if (hasSubscribers) {
      this._stop();
    }
  }

  [symbolObservable](): this {
    return this;
  }
}

/**
 * Interface representing an argument of a function passed as a second argument to the store creation shorthands (readable, writable).
 */
interface OnUseArgument<T> {
  (value: T): void;
  set: (value: T) => void;
  update: (updater: Updater<T>) => void;
}

/**
 * A convenience function to create stores that can't be modified from "outside" (that is, API of this store don't expose any state mutation methods).
 *
 * @example
 *
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
 *
 * @param value - Initial value of a readable store.
 * @param onUseFn - A function called when the number of subscribers changes from 0 to 1
 * (but not called when the number of subscribers changes from 1 to 2, ...).
 * If a function is returned, it will be called when the number of subscribers changes from 1 to 0.
 */
export function readable<T>(
  value: T,
  onUseFn: (arg: OnUseArgument<T>) => void | Unsubscriber = noop
): Readable<T> {
  const ReadableStoreWithOnUse = class extends Store<T> {
    protected onUse() {
      const setFn = (v: T) => this.set(v);
      setFn.set = setFn;
      setFn.update = (updater: Updater<T>) => this.update(updater);
      return onUseFn(setFn);
    }
  };
  return asReadable(new ReadableStoreWithOnUse(value));
}

@Injectable()
class WritableStore<T> extends Store<T> implements Writable<T> {
  constructor(value: T) {
    super(value);
  }

  set(value: T): void {
    super.set(value);
  }

  update(updater: Updater<T>) {
    super.update(updater);
  }
}

/**
 * Generic store, exposing set and update functionality.
 * It is used with a functional style, e.g. const store = writable('');
 * @param value - Initial value
 * @param onUseFn - A function called when the number of subscribers changes from 0 to 1
 * (but not called when the number of subscribers changes from 1 to 2, ...).
 * If a function is returned, it will be called when the number of subscribers changes from 1 to 0.
 *
 * @example
 *
 * ```typescript
 * const store = writable('', () => {
 *    console.log('This store is subscribed');
 *    return () => {
 *      console.log('No more subscriber');
 *    }
 * });
 *
 *
 * const unsubscribe = store.subscribe((object) => object) // Output 'This store is subscribed';
 * store.set({count: 1});
 * store.update((object) => {object.count++; return object});
 * unsubscribe(); // Output 'No more subscriber';
 * ```
 */
export function writable<T>(
  value: T,
  onUseFn: (arg: OnUseArgument<T>) => void | Unsubscriber = noop
): Writable<T> {
  const WritableStoreWithOnUse = class extends WritableStore<T> {
    protected onUse() {
      const setFn = (v: T) => this.set(v);
      setFn.set = setFn;
      setFn.update = (updater: Updater<T>) => this.update(updater);
      return onUseFn(setFn);
    }
  };
  const store = new WritableStoreWithOnUse(value);
  return {
    ...asReadable(store),
    set: store.set.bind(store),
    update: store.update.bind(store),
  };
}

type SubscribableStores =
  | SubscribableStore<any>
  | readonly [SubscribableStore<any>, ...SubscribableStore<any>[]];

type SubscribableStoresValues<S> = S extends SubscribableStore<infer T>
  ? T
  : { [K in keyof S]: S[K] extends SubscribableStore<infer T> ? T : never };

type SyncDeriveFn<T, S> = (values: SubscribableStoresValues<S>) => T;
type AsyncDeriveFn<T, S> = (
  values: SubscribableStoresValues<S>,
  set: OnUseArgument<T>
) => Unsubscriber | void;
type DeriveFn<T, S> = SyncDeriveFn<T, S> | AsyncDeriveFn<T, S>;
function isSyncDeriveFn<T, S>(fn: DeriveFn<T, S>): fn is SyncDeriveFn<T, S> {
  return fn.length <= 1;
}

/**
 *
 * Derived store, which compute values based on the values of one or more stores (they can also be derived stores).
 * Each time a store change, the 'derive' method is run with the store value
 * (or an array of store values if the derived store is based on an array of stores),
 * which allow to set the derived store value with 'this.set'.
 *
 * An initial value must be provided, and will be used if the derived value is set asynchronously
 *
 * @example
 *
 * ```typescript
 * class TotalStore extends DerivedStore<number, Readable<{a: number, b: number}>> {
 *
 *    derive(storeValue: {a: number, b: number}) {
 *       this.set(storeValue.a + storeValue.b);
 *    }
 * }
 *
 * const store = writable({a: 1, b: 2});
 * const computed = new TotalStore(store, 0);
 *
 * // Will output : 'Computed value: 3'
 * computed.subscribe((value) => {
 *    console.log('Computed value:', value)
 * })
 * ```
 *
 */
@Injectable()
export abstract class DerivedStore<
  T,
  S extends SubscribableStores = SubscribableStores
> extends Store<T> {
  constructor(private _stores: S, initialValue: T) {
    super(initialValue);
  }

  protected onUse(): Unsubscriber | void {
    let initDone = false;
    let pending = 0;

    const stores = this._stores;
    const isArray = Array.isArray(stores);
    const storesArr = isArray
      ? (stores as readonly SubscribableStore<any>[])
      : [stores as SubscribableStore<any>];
    const dependantValues = new Array(storesArr.length);

    let cleanupFn: null | Unsubscriber = null;

    const callCleanup = () => {
      const fn = cleanupFn;
      if (fn) {
        cleanupFn = null;
        callUnsubscribe(fn);
      }
    };

    const callDerive = () => {
      if (initDone && !pending) {
        callCleanup();
        cleanupFn = this.derive(isArray ? dependantValues : dependantValues[0]) || noop;
      }
    };

    const unsubscribers = storesArr.map((store, idx) =>
      store.subscribe({
        next: (v) => {
          dependantValues[idx] = v;
          pending &= ~(1 << idx);
          callDerive();
        },
        invalidate: () => {
          pending |= 1 << idx;
        },
      })
    );

    initDone = true;
    callDerive();
    return () => {
      callCleanup();
      unsubscribers.forEach(callUnsubscribe);
    };
  }

  protected abstract derive(values: SubscribableStoresValues<S>): Unsubscriber | void;
}

/**
 * Derives a store from one or more other stores. Whenever those dependencies change, the deriveFn runs.
 * This is the functional style of a {@link DerivedStore}
 *
 * @param stores - store or array of stores
 * @param deriveFn - Callback run with the store value or the array of store values
 *
 */
export function derived<T, S extends SubscribableStores>(
  stores: S,
  deriveFn: SyncDeriveFn<T, S>
): Readable<T>;
export function derived<T, S extends SubscribableStores>(
  stores: S,
  deriveFn: AsyncDeriveFn<T, S>,
  initialValue: T
): Readable<T>;
export function derived<T, S extends SubscribableStores>(
  stores: S,
  deriveFn: DeriveFn<T, S>,
  initialValue?: T
): Readable<T> {
  const Derived = isSyncDeriveFn(deriveFn)
    ? class extends DerivedStore<T, S> {
        protected derive(values: SubscribableStoresValues<S>) {
          this.set(deriveFn(values));
        }
      }
    : class extends DerivedStore<T, S> {
        protected derive(values: SubscribableStoresValues<S>) {
          const setFn = (v: T) => this.set(v);
          setFn.set = setFn;
          setFn.update = (updater: Updater<T>) => this.update(updater);
          return deriveFn(values, setFn);
        }
      };
  return asReadable(new Derived(stores, initialValue as any));
}
