/**
 * tansu is a lightweight, push-based state management library.
 * It borrows the ideas and APIs originally designed and implemented by {@link https://github.com/sveltejs/rfcs/blob/master/text/0002-reactive-stores.md | Svelte stores}.
 *
 * @packageDocumentation
 */

declare global {
  interface SymbolConstructor {
    readonly observable: symbol;
  }
}

const symbolObservable: typeof Symbol.observable =
  (typeof Symbol === 'function' && Symbol.observable) || ('@@observable' as any);

/**
 * A callback invoked when a store value changes. It is called with the latest value of a given store.
 */
export type SubscriberFunction<T> = (value: T) => void;

/**
 * A partial {@link https://github.com/tc39/proposal-observable#api | observer} notified when a store value changes. A store will call the {@link SubscriberObject.next | next} method every time the store's state is changing.
 */
export interface SubscriberObject<T> {
  /**
   * A store will call this method every time the store's state is changing.
   */
  next: SubscriberFunction<T>;
  /**
   * Unused, only declared for compatibility with rxjs.
   */
  error?: any;
  /**
   * Unused, only declared for compatibility with rxjs.
   */
  complete?: any;
  /**
   * A store will call this method when it knows that the value will be changed.
   * A call to this method will be followed by a call to {@link SubscriberObject.next | next} or to {@link SubscriberObject.resume | resume}.
   */
  pause: () => void;
  /**
   * A store will call this method if {@link SubscriberObject.pause | pause} was called previously
   * and the value finally did not need to change.
   */
  resume: () => void;
}

interface PrivateSubscriberObject<T> extends SubscriberObject<T> {
  _value: T | undefined;
  _valueIndex: number;
}

/**
 * Expresses interest in store value changes over time. It can be either:
 * - a callback function: {@link SubscriberFunction};
 * - a partial observer: {@link SubscriberObject}.
 */
export type Subscriber<T> = SubscriberFunction<T> | Partial<SubscriberObject<T>> | null | undefined;

/**
 * A function to unsubscribe from value change notifications.
 */
export type UnsubscribeFunction = () => void;

/**
 * An object with the `unsubscribe` method.
 * Subscribable stores might choose to return such object instead of directly returning {@link UnsubscribeFunction} from a subscription call.
 */
export interface UnsubscribeObject {
  /**
   * A method that acts as the {@link UnsubscribeFunction}.
   */
  unsubscribe: UnsubscribeFunction;
}

export type Unsubscriber = UnsubscribeObject | UnsubscribeFunction;

/**
 * Represents a store accepting registrations (subscribers) and "pushing" notifications on each and every store value change.
 */
export interface SubscribableStore<T> {
  /**
   * A method that makes it possible to register "interest" in store value changes over time.
   * It is called each and every time the store's value changes.
   * A registered subscriber is notified synchronously with the latest store value.
   *
   * @param subscriber - a subscriber in a form of a {@link SubscriberFunction} or a {@link SubscriberObject}. Returns a {@link Unsubscriber} (function or object with the `unsubscribe` method) that can be used to unregister and stop receiving notifications of store value changes.
   * @returns The {@link UnsubscribeFunction} or {@link UnsubscribeObject} that can be used to unsubscribe (stop state change notifications).
   */
  subscribe(subscriber: Subscriber<T>): Unsubscriber;
}

/**
 * This interface augments the base {@link SubscribableStore} interface with the Angular-specific `OnDestroy` callback. The {@link Readable} stores can be registered in the Angular DI container and will automatically discard all the subscription when a given store is destroyed.
 */
export interface Readable<T> extends SubscribableStore<T> {
  subscribe(subscriber: Subscriber<T>): UnsubscribeFunction & UnsubscribeObject;
  ngOnDestroy(): void;
  [Symbol.observable](): Readable<T>;
}

/**
 * A function that can be used to update store's value. This function is called with the current value and should return new store value.
 */
export type Updater<T> = (value: T) => T;

/**
 * Builds on top of {@link Readable} and represents a store that can be manipulated from "outside": anyone with a reference to writable store can either update or completely replace state of a given store.
 *
 * @example
 *
 * ```typescript
 * // reset counter's store value to 0 by using the {@link Writable.set} method
 * counterStore.set(0);
 *
 * // increment counter's store value by using the {@link Writable.update} method
 * counterStore.update(currentValue => currentValue + 1);
 * ```
 */
export interface Writable<T> extends Readable<T> {
  /**
   * Replaces store's state with the provided value.
   * @param value - value to be used as the new state of a store.
   */
  set(value: T): void;

  /**
   * Updates store's state by using an {@link Updater} function.
   * @param updater - a function that takes the current state as an argument and returns the new state.
   */
  update(updater: Updater<T>): void;
}

const noop = () => {};

const bind = <T>(object: T | null | undefined, fnName: keyof T) => {
  const fn = object ? object[fnName] : null;
  return typeof fn === 'function' ? fn.bind(object) : noop;
};

const toSubscriberObject = <T>(subscriber: Subscriber<T>): PrivateSubscriberObject<T> =>
  typeof subscriber === 'function'
    ? {
        next: subscriber.bind(null),
        pause: noop,
        resume: noop,
        _value: undefined,
        _valueIndex: 0,
      }
    : {
        next: bind(subscriber, 'next'),
        pause: bind(subscriber, 'pause'),
        resume: bind(subscriber, 'resume'),
        _value: undefined,
        _valueIndex: 0,
      };

const returnThis = function <T>(this: T): T {
  return this;
};

const asReadable = <T>(store: Store<T>): Readable<T> => ({
  subscribe: store.subscribe.bind(store),
  ngOnDestroy: store.ngOnDestroy.bind(store),
  [symbolObservable]: returnThis,
});

const queueProcess = Symbol();
let willProcessQueue = false;
const queue = new Set<{ [queueProcess](): void }>();

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
 * Batches multiple changes to stores while calling the provided function,
 * preventing derived stores from updating until the function returns,
 * to avoid unnecessary recomputations.
 *
 * @remarks
 *
 * If a store is updated multiple times in the provided function, listeners
 * of that store will only be called once when the provided function returns.
 *
 * It is possible to have nested calls of batch, in which case only the first
 * (outer) call has an effect, inner calls only call the provided function.
 *
 * @param fn - a function that can update stores. Its return value is
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
  if (needsProcessQueue) {
    willProcessQueue = true;
  }
  try {
    return fn();
  } finally {
    if (needsProcessQueue) {
      for (const store of queue) {
        queue.delete(store);
        store[queueProcess]();
      }
      willProcessQueue = false;
    }
  }
};

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
export function get<T>(store: SubscribableStore<T>): T {
  let value: T;
  callUnsubscribe(store.subscribe((v) => (value = v)));
  return value!;
}

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
  private _subscribers = new Set<PrivateSubscriberObject<T>>();
  private _cleanupFn: null | Unsubscriber = null;
  private _subscribersPaused = false;
  private _valueIndex = 1;

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

  private [queueProcess](): void {
    this._subscribersPaused = false;
    const valueIndex = this._valueIndex;
    const value = this._value;
    for (const subscriber of [...this._subscribers]) {
      if (subscriber._valueIndex !== valueIndex && notEqual(subscriber._value, value)) {
        subscriber._valueIndex = valueIndex;
        subscriber._value = value;
        subscriber.next(value);
      } else {
        subscriber._valueIndex = valueIndex;
        subscriber.resume();
      }
    }
  }

  /**
   * Puts the store in the paused state, which means it will soon update its value.
   *
   * @remarks
   *
   * The paused state prevents derived stores (both direct and transitive) from recomputing their value
   * using the current value of this store.
   *
   * There are two ways to put a store back into its normal state: calling {@link Store.set | set} to set a new
   * value or calling {@link Store.resumeSubscribers | resumeSubscribers} to declare that finally the value does not need to be
   * changed.
   *
   * Note that a store should not stay in the paused state for a long time, and most of the time
   * it is not needed to call pauseSubscribers or resumeSubscribers manually.
   *
   */
  protected pauseSubscribers(): void {
    if (!this._subscribersPaused) {
      this._subscribersPaused = true;
      for (const subscriber of [...this._subscribers]) {
        subscriber.pause();
      }
    }
  }

  /**
   * Puts the store back to the normal state without changing its value, if it was in the paused state
   * (cf {@link Store.pauseSubscribers | pauseSubscribers}).
   *
   * @remarks
   *
   * Does nothing if the store was not in the paused state.
   */
  protected resumeSubscribers(): void {
    if (this._subscribersPaused) {
      batch(() => {
        queue.add(this as any);
      });
    }
  }

  /**
   * Replaces store's state with the provided value.
   * Equivalent of {@link Writable.set}, but internal to the store.
   *
   * @param value - value to be used as the new state of a store.
   */
  protected set(value: T): void {
    if (notEqual(this._value, value)) {
      this._valueIndex++;
      this._value = value;
      if (!this._cleanupFn) {
        // subscriber not yet initialized
        return;
      }
      this.pauseSubscribers();
    }
    this.resumeSubscribers();
  }

  /**
   * Updates store's state by using an {@link Updater} function.
   * Equivalent of {@link Writable.update}, but internal to the store.
   *
   * @param updater - a function that takes the current state as an argument and returns the new state.
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
  protected onUse(): Unsubscriber | void {}

  /**
   * Default Implementation of the {@link SubscribableStore.subscribe}, not meant to be overridden.
   * @param subscriber - see {@link SubscribableStore.subscribe}
   */
  subscribe(subscriber: Subscriber<T>): UnsubscribeFunction & UnsubscribeObject {
    const subscriberObject = toSubscriberObject(subscriber);
    this._subscribers.add(subscriberObject);
    if (this._subscribers.size == 1) {
      this._start();
    }
    subscriberObject._valueIndex = this._valueIndex;
    subscriberObject._value = this._value;
    subscriberObject.next(this._value);
    if (this._subscribersPaused) {
      subscriberObject.pause();
    }

    const unsubscribe = () => {
      const removed = this._subscribers.delete(subscriberObject);
      subscriberObject.next = noop;
      subscriberObject.pause = noop;
      subscriberObject.resume = noop;
      subscriberObject._value = undefined;
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

export interface OnUseArgument<T> {
  (value: T): void;
  set: (value: T) => void;
  update: (updater: Updater<T>) => void;
}

const noopUnsubscribe = () => {};
noopUnsubscribe.unsubscribe = noopUnsubscribe;

/**
 * A convenience function to create an optimized constant store (i.e. which never changes
 * its value). It does not keep track of its subscribers.
 * @param value - value of the store, which will never change
 */
function constStore<T>(value: T): Readable<T> {
  return {
    subscribe(subscriber: Subscriber<T>) {
      toSubscriberObject(subscriber).next(value);
      return noopUnsubscribe;
    },
    [symbolObservable]: returnThis,
    ngOnDestroy: noop,
  };
}

/**
 * A convenience function to create {@link Readable} store instances.
 * @param value - Initial value of a readable store.
 * @param onUseFn - A function called when the number of subscribers changes from 0 to 1
 * (but not called when the number of subscribers changes from 1 to 2, ...).
 * If a function is returned, it will be called when the number of subscribers changes from 1 to 0.
 *
 * @example
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
export function readable<T>(
  value: T,
  onUseFn: (arg: OnUseArgument<T>) => void | Unsubscriber = noop
): Readable<T> {
  if (onUseFn === noop) {
    // special optimized case
    return constStore(value);
  }
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
 * A convenience function to create {@link Writable} store instances.
 * @param value - initial value of a new writable store.
 * @param onUseFn - A function called when the number of subscribers changes from 0 to 1
 * (but not called when the number of subscribers changes from 1 to 2, ...).
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
    let changed = 0;

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
        if (changed) {
          changed = 0;
          callCleanup();
          cleanupFn = this.derive(isArray ? dependantValues : dependantValues[0]) || noop;
        }
        this.resumeSubscribers();
      }
    };

    const unsubscribers = storesArr.map((store, idx) =>
      store.subscribe({
        next: (v) => {
          dependantValues[idx] = v;
          changed |= 1 << idx;
          pending &= ~(1 << idx);
          callDerive();
        },
        pause: () => {
          pending |= 1 << idx;
          this.pauseSubscribers();
        },
        resume: () => {
          pending &= ~(1 << idx);
          callDerive();
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
 * A convenience function to create a new store with a state computed from the latest values of dependent stores.
 * Each time the state of one of the dependent stores changes, a provided derive function is called to compute a new, derived state.
 *
 * @param stores - a single store or an array of dependent stores
 * @param deriveFn - a function that is used to compute a new state based on the latest values of dependent stores
 *
 * @example
 * ```typescript
 * const x$ = writable(2);
 * const y$ = writable(3);
 * const sum$ = derived([x$, $y], ([x, y]) => x + y);
 *
 * // will log 5 upon subscription
 * sum$.subscribe((value) => {
 *    console.log(value)
 * });
 *
 * x$.set(3); // will re-evaluate the `([x, y]) => x + y` function and log 6 as this is the new state of the derived store
 * ```
 */
export function derived<T, S extends SubscribableStores>(
  stores: S,
  deriveFn: SyncDeriveFn<T, S>,
  initialValue?: T
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
