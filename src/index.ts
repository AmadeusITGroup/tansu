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

/**
 * Symbol used in {@link InteropObservable} allowing any object to expose an observable.
 */
export const symbolObservable: typeof Symbol.observable =
  (typeof Symbol === 'function' && Symbol.observable) || ('@@observable' as any);

const oldSubscription = Symbol();

/**
 * A callback invoked when a store value changes. It is called with the latest value of a given store.
 */
export type SubscriberFunction<T> = ((value: T) => void) &
  Partial<Omit<SubscriberObject<T>, 'next'>>;

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
  /**
   * @internal
   * Value returned from a previous call to subscribe, and corresponding to a subscription to resume.
   * This subscription must no longer be active. The new subscriber will not be called synchronously if
   * the value did not change compared to the last value received in this old subscription.
   */
  [oldSubscription]?: Unsubscriber;
}

interface PrivateSubscriberObject<T> extends Omit<SubscriberObject<T>, 'oldSubscription'> {
  _value: T;
  _valueIndex: number;
  _paused: boolean;
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
 * An interface for interoperability between observable implementations. It only has to expose the `[Symbol.observable]` method that is supposed to return a subscribable store.
 */
export interface InteropObservable<T> {
  [Symbol.observable]: () => SubscribableStore<T>;
}

/**
 * Valid types that can be considered as a store.
 */
export type StoreInput<T> = SubscribableStore<T> | InteropObservable<T>;

/**
 * This interface augments the base {@link SubscribableStore} interface by requiring the return value of the subscribe method to be both a function and an object with the `unsubscribe` method.
 * For {@link https://rxjs.dev/api/index/interface/InteropObservable | interoperability with rxjs}, it also implements the `[Symbol.observable]` method.
 */
export interface Readable<T> extends SubscribableStore<T>, InteropObservable<T> {
  subscribe(subscriber: Subscriber<T>): UnsubscribeFunction & UnsubscribeObject;
  [Symbol.observable](): Readable<T>;
}

/**
 * This interface augments the base {@link Readable} interface by adding the ability to call the store as a function to get its value.
 */
export interface ReadableSignal<T> extends Readable<T> {
  /**
   * Returns the value of the store. This is a shortcut for calling {@link get} with the store.
   */
  (): T;
}

/**
 * A function that can be used to update store's value. This function is called with the current value and should return new store value.
 */
export type Updater<T, U = T> = (value: T) => U;

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
export interface Writable<T, U = T> extends Readable<T> {
  /**
   * Replaces store's state with the provided value.
   * @param value - value to be used as the new state of a store.
   */
  set(value: U): void;

  /**
   * Updates store's state by using an {@link Updater} function.
   * @param updater - a function that takes the current state as an argument and returns the new state.
   */
  update(updater: Updater<T, U>): void;
}

/**
 * Represents a store that implements both {@link ReadableSignal} and {@link Writable}.
 * This is the type of objects returned by {@link writable}.
 */
export interface WritableSignal<T, U = T> extends ReadableSignal<T>, Writable<T, U> {}

const noop = () => {};

const noopUnsubscribe = () => {};
noopUnsubscribe.unsubscribe = noopUnsubscribe;

const bind = <T>(object: T | null | undefined, fnName: keyof T) => {
  const fn = object ? object[fnName] : null;
  return typeof fn === 'function' ? fn.bind(object) : noop;
};

const toSubscriberObject = <T>(subscriber: Subscriber<T>): PrivateSubscriberObject<T> => ({
  next: typeof subscriber === 'function' ? subscriber.bind(null) : bind(subscriber, 'next'),
  pause: bind(subscriber, 'pause'),
  resume: bind(subscriber, 'resume'),
  _value: undefined as any,
  _valueIndex: 0,
  _paused: false,
});

const returnThis = function <T>(this: T): T {
  return this;
};

const normalizeUnsubscribe = (
  unsubscribe: Unsubscriber | void | null | undefined
): UnsubscribeFunction & UnsubscribeObject => {
  if (!unsubscribe) {
    return noopUnsubscribe;
  }
  if ((unsubscribe as any).unsubscribe === unsubscribe) {
    return unsubscribe as any;
  }
  const res: any =
    typeof unsubscribe === 'function' ? () => unsubscribe() : () => unsubscribe.unsubscribe();
  res.unsubscribe = res;
  return res;
};

const normalizedSubscribe = new WeakSet<Readable<any>['subscribe']>();
const normalizeSubscribe = <T>(store: SubscribableStore<T>): Readable<T>['subscribe'] => {
  let res: Readable<T>['subscribe'] = store.subscribe as any;
  if (!normalizedSubscribe.has(res)) {
    res = (...args: [Subscriber<T>]) => normalizeUnsubscribe(store.subscribe(...args));
    normalizedSubscribe.add(res);
  }
  return res;
};

const getNormalizedSubscribe = <T>(input: StoreInput<T>) => {
  const store = 'subscribe' in input ? input : input[symbolObservable]();
  return normalizeSubscribe(store);
};

const getValue = <T>(subscribe: Readable<T>['subscribe']): T => {
  let value: T;
  subscribe((v) => (value = v))();
  return value!;
};

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
  const subscribe = getNormalizedSubscribe(store);
  const res = Object.assign(() => get(res), extraProp, {
    subscribe,
    [symbolObservable]: returnThis,
  });
  return res;
}

const triggerUpdate = Symbol();
const queueProcess = Symbol();
let willProcessQueue = false;
const queue = new Set<{ [queueProcess](): void }>();

const MAX_STORE_PROCESSING_IN_QUEUE = 1000;
const checkIterations = (iterations: number) => {
  if (iterations > MAX_STORE_PROCESSING_IN_QUEUE) {
    throw new Error('reached maximum number of store changes in one shot');
  }
};

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
      try {
        const storePasses = new Map<{ [queueProcess](): void }, number>();
        for (const store of queue) {
          const storeCount = storePasses.get(store) ?? 0;
          checkIterations(storeCount);
          storePasses.set(store, storeCount + 1);
          queue.delete(store);
          store[queueProcess]();
        }
      } finally {
        queue.clear();
        willProcessQueue = false;
      }
    }
  }
};

const defaultReactiveContext = <T>(store: StoreInput<T>) => getValue(getNormalizedSubscribe(store));
let reactiveContext = defaultReactiveContext;

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
export const get = <T>(store: StoreInput<T>): T => reactiveContext(store);

const createEqualCache = (valueIndex: number): Record<number, boolean> => ({
  [valueIndex]: true, // the subscriber already has the last value
  0: false, // the subscriber never received any value
});

const createEqualCacheFromSet = (valueIndex: number): Record<number, boolean> => {
  const res = createEqualCache(valueIndex);
  res[valueIndex - 1] = false; // the subscriber had the previous value,
  // which is known to be different because equal is called in the set method
  return res;
};

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
  #subscribers = new Set<PrivateSubscriberObject<T>>();
  #cleanupFn: null | UnsubscribeFunction = null;
  #subscribersPaused = false;
  #valueIndex = 1;
  #value: T;
  #equalCache: ReturnType<typeof createEqualCache> | undefined;
  #oldSubscriptions = new WeakMap<Unsubscriber, PrivateSubscriberObject<T>>();

  /**
   *
   * @param value - Initial value of the store
   */
  constructor(value: T) {
    this.#value = value;
  }

  #start() {
    this.#cleanupFn = normalizeUnsubscribe(this.onUse());
  }

  #stop() {
    const cleanupFn = this.#cleanupFn;
    if (cleanupFn) {
      this.#cleanupFn = null;
      cleanupFn();
    }
  }

  private [queueProcess](): void {
    const valueIndex = this.#valueIndex;
    for (const subscriber of [...this.#subscribers]) {
      if (this.#subscribersPaused || this.#valueIndex !== valueIndex) {
        // the value of the store can change while notifying subscribers
        // in that case, let's just stop notifying subscribers
        // they will be called later through another queueProcess call
        // with the correct final value and in the right order
        return;
      }
      if (subscriber._valueIndex === 0) {
        // ignore subscribers which were not yet called synchronously
        continue;
      }
      this.#notifySubscriber(subscriber);
    }
  }

  /** @internal */
  protected [triggerUpdate](): void {}

  #notifySubscriber(subscriber: PrivateSubscriberObject<T>): void {
    const valueIndex = this.#valueIndex;
    let equalCache = this.#equalCache;
    if (!equalCache) {
      equalCache = createEqualCache(valueIndex);
      this.#equalCache = equalCache;
    }
    const value = this.#value;
    let equal = equalCache[subscriber._valueIndex];
    if (equal == null) {
      equal = !!this.equal(subscriber._value, value);
      equalCache[subscriber._valueIndex] = equal;
    }
    subscriber._valueIndex = valueIndex;
    if (!equal) {
      subscriber._value = value;
      subscriber._paused = false;
      subscriber.next(value);
    } else if (!this.#subscribersPaused && subscriber._paused) {
      subscriber._paused = false;
      subscriber.resume();
    }
  }

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
    return !Object.is(a, b) || (a && typeof a === 'object') || typeof a === 'function';
  }

  /**
   * Puts the store in the paused state, which means it will soon update its value.
   *
   * @remarks
   *
   * The paused state prevents derived or computed stores (both direct and transitive) from recomputing their value
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
    if (!this.#subscribersPaused) {
      this.#subscribersPaused = true;
      queue.delete(this as any);
      for (const subscriber of [...this.#subscribers]) {
        if (subscriber._valueIndex === 0 || subscriber._paused) {
          // ignore subscribers which were not yet called synchronously or are already paused
          continue;
        }
        subscriber._paused = true;
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
    if (this.#subscribersPaused) {
      this.#subscribersPaused = false;
      if (this.#subscribers.size) {
        batch(() => {
          queue.add(this as any);
        });
      }
    }
  }

  /**
   * Replaces store's state with the provided value.
   * Equivalent of {@link Writable.set}, but internal to the store.
   *
   * @param value - value to be used as the new state of a store.
   */
  protected set(value: T): void {
    // only call equal here to compare with the previous value if the store is active
    const callEqual = this.#cleanupFn;
    const changeValue = callEqual ? !this.equal(this.#value, value) : true;
    if (changeValue) {
      this.#value = value;
      if (callEqual || this.#equalCache) {
        this.#valueIndex++;
        this.#equalCache = callEqual ? createEqualCacheFromSet(this.#valueIndex) : undefined;
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
    this.set(updater(this.#value));
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
    const oldSubscriptionParam = subscriber?.[oldSubscription];
    if (oldSubscriptionParam) {
      const oldSubscriberObject = this.#oldSubscriptions.get(oldSubscriptionParam);
      if (oldSubscriberObject) {
        subscriberObject._value = oldSubscriberObject._value;
        subscriberObject._valueIndex = oldSubscriberObject._valueIndex;
      }
    }
    this.#subscribers.add(subscriberObject);
    batch(() => {
      if (this.#subscribers.size == 1) {
        this.#start();
      } else {
        this[triggerUpdate]();
      }
    });
    this.#notifySubscriber(subscriberObject);

    const unsubscribe = () => {
      const removed = this.#subscribers.delete(subscriberObject);
      subscriberObject.next = noop;
      subscriberObject.pause = noop;
      subscriberObject.resume = noop;
      if (removed) {
        this.#oldSubscriptions.set(unsubscribe, subscriberObject);
        if (this.#subscribers.size === 0) {
          this.#stop();
        }
      }
    };
    (unsubscribe as any)[triggerUpdate] = () => {
      this[triggerUpdate]();
      this.#notifySubscriber(subscriberObject);
    };
    unsubscribe.unsubscribe = unsubscribe;
    return unsubscribe;
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

/**
 * Type of a function that is called when the number of subscribers changes from 0 to 1
 * (but not called when the number of subscribers changes from 1 to 2, ...).
 * If it returns a function, that function will be called when the number of subscribers changes from 1 to 0.
 */
export type OnUseFn<T> = (arg: OnUseArgument<T>) => void | Unsubscriber;

/**
 * Store options that can be passed to {@link readable} or {@link writable}.
 */
export interface StoreOptions<T> {
  /**
   * A function that is called when the number of subscribers changes from 0 to 1
   * (but not called when the number of subscribers changes from 1 to 2, ...).
   * If it returns a function, that function will be called when the number of subscribers changes from 1 to 0.
   */
  onUse?: OnUseFn<T>;

  /**
   * Custom function to compare two values, that should return true if they
   * are equal.
   * It is called when setting a new value to avoid doing anything
   * (such as notifying subscribers) if the value did not change.
   * The default logic (when this option is not present) is to return false
   * if `a` is a function or an object, or if `a` and `b` are different
   * according to `Object.is`.
   *
   * @remarks
   * equal takes precedence over {@link StoreOptions.notEqual} if both
   * are defined.
   *
   * @param a - First value to compare.
   * @param b - Second value to compare.
   * @returns true if a and b are considered equal.
   */
  equal?: (a: T, b: T) => boolean;

  /**
   * Custom function to compare two values, that should return true if they
   * are different.
   * It is called when setting a new value to avoid doing anything
   * (such as notifying subscribers) if the value did not change.
   * The default logic (when this option is not present) is to return true
   * if `a` is a function or an object, or if `a` and `b` are different
   * according to `Object.is`.
   *
   * @remarks
   * {@link StoreOptions.equal} takes precedence over notEqual if both
   * are defined.
   *
   * @deprecated Use {@link StoreOptions.equal} instead
   * @param a - First value to compare.
   * @param b - Second value to compare.
   * @returns true if a and b are considered different.
   */
  notEqual?: (a: T, b: T) => boolean;
}

/**
 * A convenience function to create an optimized constant store (i.e. which never changes
 * its value). It does not keep track of its subscribers.
 * @param value - value of the store, which will never change
 */
function constStore<T>(value: T): ReadableSignal<T> {
  const subscribe = (subscriber: Subscriber<T>) => {
    if (!subscriber?.[oldSubscription]) {
      toSubscriberObject(subscriber).next(value);
    }
    return noopUnsubscribe;
  };
  normalizedSubscribe.add(subscribe);
  return Object.assign(() => value, { subscribe, [symbolObservable]: returnThis });
}

class WritableStore<T> extends Store<T> implements Writable<T> {
  constructor(value: T) {
    super(value);
  }

  override set(value: T): void {
    super.set(value);
  }

  override update(updater: Updater<T>) {
    super.update(updater);
  }
}

const applyStoreOptions = <T, S extends Store<T>>(store: S, options: StoreOptions<T>): S => {
  const { onUse, equal, notEqual } = options;
  if (onUse) {
    (store as any).onUse = function (this: Store<T>) {
      const setFn = (v: T) => this.set(v);
      setFn.set = setFn;
      setFn.update = (updater: Updater<T>) => this.update(updater);
      return onUse(setFn);
    };
  }
  if (equal) {
    (store as any).equal = function (this: Store<T>, a: T, b: T) {
      return equal(a, b);
    };
  }
  if (notEqual) {
    (store as any).notEqual = function (this: Store<T>, a: T, b: T) {
      return notEqual(a, b);
    };
  }
  return store;
};

/**
 * A convenience function to create {@link Readable} store instances.
 * @param value - Initial value of a readable store.
 * @param options - Either an object with {@link StoreOptions | store options}, or directly the onUse function.
 * The onUse function is a function called when the number of subscribers changes from 0 to 1
 * (but not called when the number of subscribers changes from 1 to 2, ...).
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
export function readable<T>(
  value: T,
  options: StoreOptions<T> | OnUseFn<T> = {}
): ReadableSignal<T> {
  if (typeof options === 'function') {
    options = { onUse: options };
  }
  if (!options.onUse) {
    // special optimized case
    return constStore(value);
  }
  return asReadable(applyStoreOptions(new WritableStore(value), options));
}

/**
 * A convenience function to create {@link Writable} store instances.
 * @param value - initial value of a new writable store.
 * @param options - Either an object with {@link StoreOptions | store options}, or directly the onUse function.
 * The onUse function is a function called when the number of subscribers changes from 0 to 1
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
  options: StoreOptions<T> | OnUseFn<T> = {}
): WritableSignal<T> {
  if (typeof options === 'function') {
    options = { onUse: options };
  }
  const store = applyStoreOptions(new WritableStore(value), options);
  return asReadable<T, Pick<Writable<T>, 'set' | 'update'>>(store, {
    set: store.set.bind(store),
    update: store.update.bind(store),
  });
}

/**
 * Either a single {@link StoreInput} or a read-only array of at least one {@link StoreInput}.
 */
export type StoresInput = StoreInput<any> | readonly [StoreInput<any>, ...StoreInput<any>[]];

/**
 * Extracts the types of the values of the stores from a type extending {@link StoresInput}.
 *
 * @remarks
 *
 * If the type given as a parameter is a single {@link StoreInput}, the type of the value
 * of that {@link StoreInput} is returned. If the type given as a parameter is one of an array
 * of {@link StoreInput}, the returned type is the type of an array containing the value of each
 * store in the same order.
 */
export type StoresInputValues<S> = S extends StoreInput<infer T>
  ? T
  : { [K in keyof S]: S[K] extends StoreInput<infer T> ? T : never };

type SyncDeriveFn<T, S> = (values: StoresInputValues<S>) => T;
interface SyncDeriveOptions<T, S> extends Omit<StoreOptions<T>, 'onUse'> {
  derive: SyncDeriveFn<T, S>;
}
type AsyncDeriveFn<T, S> = (
  values: StoresInputValues<S>,
  set: OnUseArgument<T>
) => Unsubscriber | void;
interface AsyncDeriveOptions<T, S> extends Omit<StoreOptions<T>, 'onUse'> {
  derive: AsyncDeriveFn<T, S>;
}
type DeriveFn<T, S> = SyncDeriveFn<T, S> | AsyncDeriveFn<T, S>;
interface DeriveOptions<T, S> extends Omit<StoreOptions<T>, 'onUse'> {
  derive: DeriveFn<T, S>;
}
function isSyncDeriveFn<T, S>(fn: DeriveFn<T, S>): fn is SyncDeriveFn<T, S> {
  return fn.length <= 1;
}

const callFn = (fn: () => void) => fn();

export abstract class DerivedStore<T, S extends StoresInput = StoresInput> extends Store<T> {
  readonly #isArray: boolean;
  readonly #storesSubscribeFn: Readable<any>['subscribe'][];
  #pending = 0;

  constructor(stores: S, initialValue: T) {
    super(initialValue);
    const isArray = Array.isArray(stores);
    this.#isArray = isArray;
    this.#storesSubscribeFn = (isArray ? [...stores] : [stores]).map(getNormalizedSubscribe);
  }

  protected override resumeSubscribers(): void {
    if (!this.#pending) {
      // only resume subscribers if we know that the values of the stores with which
      // the derived function was called were the correct ones
      super.resumeSubscribers();
    }
  }

  protected override onUse(): Unsubscriber | void {
    let initDone = false;
    let changed = 0;

    const isArray = this.#isArray;
    const storesSubscribeFn = this.#storesSubscribeFn;
    const dependantValues = new Array(storesSubscribeFn.length);

    let cleanupFn: null | UnsubscribeFunction = null;

    const callCleanup = () => {
      const fn = cleanupFn;
      if (fn) {
        cleanupFn = null;
        fn();
      }
    };

    const callDerive = (setInitDone = false) => {
      if (setInitDone) {
        initDone = true;
      }
      if (initDone && !this.#pending) {
        if (changed) {
          changed = 0;
          callCleanup();
          cleanupFn = normalizeUnsubscribe(
            this.derive(isArray ? dependantValues : dependantValues[0])
          );
        }
        this.resumeSubscribers();
      }
    };

    const unsubscribers = storesSubscribeFn.map((subscribe, idx) => {
      const subscriber = (v: any) => {
        dependantValues[idx] = v;
        changed |= 1 << idx;
        this.#pending &= ~(1 << idx);
        callDerive();
      };
      subscriber.next = subscriber;
      subscriber.pause = () => {
        this.#pending |= 1 << idx;
        this.pauseSubscribers();
      };
      subscriber.resume = () => {
        this.#pending &= ~(1 << idx);
        callDerive();
      };
      return subscribe(subscriber);
    });

    const triggerSubscriberPendingUpdate = (unsubscriber: any, idx: number) => {
      if (this.#pending & (1 << idx)) {
        unsubscriber[triggerUpdate]?.();
      }
    };
    this[triggerUpdate] = () => {
      let iterations = 0;
      while (this.#pending) {
        checkIterations(++iterations);
        initDone = false;
        unsubscribers.forEach(triggerSubscriberPendingUpdate);
        if (this.#pending) {
          // safety check: if pending is not 0 after calling triggerUpdate,
          // it will never be and this is an endless loop
          break;
        }
        callDerive(true);
      }
    };
    callDerive(true);
    this[triggerUpdate]();
    return () => {
      this[triggerUpdate] = noop;
      callCleanup();
      unsubscribers.forEach(callFn);
    };
  }

  protected abstract derive(values: StoresInputValues<S>): Unsubscriber | void;
}

/**
 * A convenience function to create a new store with a state computed from the latest values of dependent stores.
 * Each time the state of one of the dependent stores changes, a provided derive function is called to compute a new, derived state.
 *
 * @param stores - a single store or an array of dependent stores
 * @param options - either an object with store options including a derive function or directly the derive function itself.
 * The derive function is used to compute a new state based on the latest values of dependent stores
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
  const Derived = isSyncDeriveFn(derive)
    ? class extends DerivedStore<T, S> {
        protected override derive(values: StoresInputValues<S>) {
          this.set(derive(values));
        }
      }
    : class extends DerivedStore<T, S> {
        protected override derive(values: StoresInputValues<S>) {
          const setFn = (v: T) => this.set(v);
          setFn.set = setFn;
          setFn.update = (updater: Updater<T>) => this.update(updater);
          return derive(values, setFn);
        }
      };
  return asReadable(
    applyStoreOptions(new Derived(stores, initialValue as any), {
      ...opts,
      onUse: undefined /* setting onUse is not allowed from derived */,
    })
  );
}

/**
 * Stops the tracking of dependencies made by {@link computed} and calls the provided function.
 * After the function returns, the tracking of dependencies continues as before.
 *
 * @param fn - function to be called
 * @returns the value returned by the given function
 */
export const untrack = <T>(fn: () => T): T => {
  const previousReactiveContext = reactiveContext;
  try {
    reactiveContext = defaultReactiveContext;
    return fn();
  } finally {
    reactiveContext = previousReactiveContext;
  }
};

interface ComputedStoreSubscription<T> {
  versionIndex: number;
  resubscribe: () => void;
  unsubscribe: UnsubscribeFunction;
  pending: boolean;
  usedValueIndex: number;
  valueIndex: number;
  value: T;
}

const callUnsubscribe = <T>({ unsubscribe }: ComputedStoreSubscription<T>) => unsubscribe();
const callResubscribe = <T>({ resubscribe }: ComputedStoreSubscription<T>) => resubscribe();

abstract class ComputedStore<T> extends Store<T> {
  #computing = false;
  #skipCallCompute = false;
  #versionIndex = 0;
  #subscriptions = new Map<StoreInput<any>, ComputedStoreSubscription<any>>();

  #reactiveContext = <U>(storeInput: StoreInput<U>): U =>
    untrack(() => this.#getSubscriptionValue(storeInput));

  constructor() {
    super(undefined as T);
  }

  #createSubscription<T>(subscribe: Readable<T>['subscribe']) {
    const res: ComputedStoreSubscription<T> = {
      versionIndex: this.#versionIndex,
      unsubscribe: noop,
      resubscribe: noop,
      pending: false,
      usedValueIndex: 0,
      value: undefined as T,
      valueIndex: 0,
    };
    const subscriber: SubscriberFunction<T> & Partial<SubscriberObject<T>> = (value: T) => {
      res.value = value;
      res.valueIndex++;
      res.pending = false;
      if (!this.#skipCallCompute && !this.#isPending()) {
        batch(() => this.#callCompute());
      }
    };
    subscriber.next = subscriber;
    subscriber.pause = () => {
      res.pending = true;
      this.pauseSubscribers();
    };
    subscriber.resume = () => {
      res.pending = false;
      if (!this.#skipCallCompute && !this.#isPending()) {
        batch(() => this.#callCompute());
      }
    };
    res.resubscribe = () => {
      res.unsubscribe = subscribe(subscriber);
      subscriber[oldSubscription] = res.unsubscribe;
    };
    res.resubscribe();
    return res;
  }

  #getSubscriptionValue<T>(storeInput: StoreInput<T>) {
    let res = this.#subscriptions.get(storeInput);
    if (res) {
      res.versionIndex = this.#versionIndex;
      (res.unsubscribe as any)[triggerUpdate]?.();
    } else {
      res = this.#createSubscription(getNormalizedSubscribe(storeInput));
      this.#subscriptions.set(storeInput, res);
    }
    res.usedValueIndex = res.valueIndex;
    return res.value;
  }

  #callCompute(resubscribe = false) {
    this.#computing = true;
    this.#skipCallCompute = true;
    try {
      if (this.#versionIndex > 0) {
        if (resubscribe) {
          this.#subscriptions.forEach(callResubscribe);
        }
        if (!this.#hasChange()) {
          this.resumeSubscribers();
          return;
        }
      }
      this.#versionIndex++;
      const versionIndex = this.#versionIndex;
      const previousReactiveContext = reactiveContext;
      let value: T;
      try {
        reactiveContext = this.#reactiveContext;
        value = this.compute();
      } finally {
        reactiveContext = previousReactiveContext;
      }
      this.set(value);
      for (const [store, info] of this.#subscriptions) {
        if (info.versionIndex !== versionIndex) {
          this.#subscriptions.delete(store);
          info.unsubscribe();
        }
      }
    } finally {
      this.#skipCallCompute = false;
      this.#computing = false;
    }
  }

  #isPending() {
    for (const [, { pending }] of this.#subscriptions) {
      if (pending) {
        return true;
      }
    }
    return false;
  }

  #hasChange() {
    for (const [, { valueIndex, usedValueIndex }] of this.#subscriptions) {
      if (valueIndex != usedValueIndex) {
        return true;
      }
    }
    return false;
  }

  protected override resumeSubscribers(): void {
    if (!this.#isPending()) {
      super.resumeSubscribers();
    }
  }

  /** @internal */
  protected override [triggerUpdate](): void {
    if (this.#computing) {
      throw new Error('recursive computed');
    }
    let iterations = 0;
    while (this.#isPending()) {
      checkIterations(++iterations);
      this.#skipCallCompute = true;
      try {
        for (const [, { pending, unsubscribe }] of this.#subscriptions) {
          if (pending) {
            (unsubscribe as any)[triggerUpdate]?.();
          }
        }
      } finally {
        this.#skipCallCompute = false;
      }
      if (this.#isPending()) {
        // safety check: if it is still pending after calling triggerUpdate,
        // it will always be and this is an endless loop
        break;
      }
      this.#callCompute();
    }
  }

  protected abstract compute(): T;

  protected override onUse(): Unsubscriber {
    this.#callCompute(true);
    this[triggerUpdate]();
    return () => this.#subscriptions.forEach(callUnsubscribe);
  }
}

/**
 * Creates a store whose value is computed by the provided function.
 *
 * @remarks
 *
 * The computation function is first called the first time the store is used.
 * It can use the value of other stores or observables and the computation function is called again if the value of those dependencies
 * changed, as long as the store is still used.
 * Dependencies are detected automatically as the computation function gets their value either by calling the stores
 * as a function (as it is possible with stores implementing {@link ReadableSignal}), or by calling the {@link get} function
 * (with a store or any observable). If some calls made by the function should not be tracked as dependencies, it is possible
 * to wrap them in a call to {@link untrack}.
 * Note that dependencies can change between calls of the computation function. Internally, tansu will subscribe to new dependencies
 * when they are used and unsubscribe from dependencies that are no longer used after the call of the computation function.
 *
 * @param fn - computation function that returns the value of the store
 * @param options - store options
 * @returns store containing the value returned by the computation function
 */
export function computed<T>(
  fn: () => T,
  options: Omit<StoreOptions<T>, 'onUse'> = {}
): ReadableSignal<T> {
  const Computed = class extends ComputedStore<T> {
    protected override compute(): T {
      return fn();
    }
  };
  return asReadable(
    applyStoreOptions(new Computed(), {
      ...options,
      onUse: undefined /* setting onUse is not allowed from computed */,
    })
  );
}
