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

import { Signal } from 'signal-polyfill';

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

interface PrivateSubscriberObject<T> extends Omit<SubscriberObject<T>, typeof oldSubscription> {
  _new: boolean;
  _paused: boolean;
  _changeChecker: () => { value: T; changed: boolean };
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
   *
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
 * Represents a store whose value can be retrieved with a get function that tracks its usage as specified in the Signal proposal specification.
 */
export interface SignalStore<T> {
  get(): T;
}

/**
 * Valid types that can be considered as a store.
 */
export type StoreInput<T> =
  | (() => T)
  | SignalStore<T>
  | SubscribableStore<T>
  | InteropObservable<T>;

/**
 * This interface augments the base {@link SubscribableStore} interface by requiring the return value of the subscribe method to be both a function and an object with the `unsubscribe` method.
 *
 * For {@link https://rxjs.dev/api/index/interface/InteropObservable | interoperability with rxjs}, it also implements the `[Symbol.observable]` method.
 */
export interface Readable<T> extends SignalStore<T>, SubscribableStore<T>, InteropObservable<T> {
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

const changeChecker = <T>(store: SignalStore<T>): PrivateSubscriberObject<T>['_changeChecker'] => {
  let changed = false;
  let value: T = undefined as T;
  const computedSignal = new Signal.Computed(() => {
    changed = true;
    value = store.get();
  });
  return () => {
    changed = false;
    computedSignal.get();
    return { changed, value };
  };
};

const toSubscriberObject = <T>(
  subscriber: Subscriber<T>,
  _changeChecker: PrivateSubscriberObject<T>['_changeChecker']
): PrivateSubscriberObject<T> => ({
  next: typeof subscriber === 'function' ? subscriber.bind(null) : bind(subscriber, 'next'),
  pause: bind(subscriber, 'pause'),
  resume: bind(subscriber, 'resume'),
  _new: true,
  _paused: false,
  _changeChecker,
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

const normalizeSubscribe = <T>(store: SubscribableStore<T>): Readable<T>['subscribe'] => {
  let res: Readable<T>['subscribe'] = store.subscribe as any;
  if (!normalizedSubscribe.has(res)) {
    res = (...args: [Subscriber<T>]) => normalizeUnsubscribe(store.subscribe(...args));
    normalizedSubscribe.add(res);
  }
  return res;
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
  const storeGetter = toSignalFn(store);
  return Object.assign(() => storeGetter(), extraProp, {
    get: () => storeGetter(),
    subscribe: toSubscribe(store),
    [symbolObservable]: returnThis,
  });
}

const defaultUpdate: any = function <T, U>(this: Writable<T, U>, updater: Updater<T, U>) {
  this.set(updater(untrack(() => get(this))));
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

const triggerUpdate = Symbol();

let willProcessQueueSync = false;
let willProcessQueueAsync = false;
let asyncStoresToNotifyQueue = new Set<() => void>();
let syncStoresToNotifyQueue = new Set<() => void>();

const planNotifyStore = (storeNotifier: () => void) => {
  if (willProcessQueueSync) {
    syncStoresToNotifyQueue.add(storeNotifier);
  } else {
    asyncStoresToNotifyQueue.add(storeNotifier);
    if (!willProcessQueueAsync) {
      willProcessQueueAsync = true;
      (async () => {
        await 0;
        batch(() => {
          willProcessQueueAsync = false;
          syncStoresToNotifyQueue = asyncStoresToNotifyQueue;
          asyncStoresToNotifyQueue = new Set();
        });
      })();
    }
  }
};
const unplanNotifyStore = (storeNotifier: () => void) => {
  asyncStoresToNotifyQueue.delete(storeNotifier);
  syncStoresToNotifyQueue.delete(storeNotifier);
};

const returnFalse = () => false;
const returnTrue = () => true;
const normalizedSubscribe = new WeakSet();
const createSubscribeFromSignal = <T>(store: Signal.State<T> | Signal.Computed<T>) => {
  let changeNotification = false;
  const watcher = new Signal.subtle.Watcher(() => {
    changeNotification = true;
    unplanNotifyStore(storeNotifier);
    planNotifyStore(storeNotifier);
    for (const subscriber of [...subscribers]) {
      // FIXME: skip new subscriber?
      pauseSubscriber(subscriber);
    }
    watcher.watch(); // re-enable watch
  });
  const subscribers = new Set<PrivateSubscriberObject<T>>();
  const storeNotifier = () => {
    changeNotification = false;
    for (const subscriber of [...subscribers]) {
      if (changeNotification) {
        // the value of the store can change while notifying subscribers
        // in that case, let's just stop notifying subscribers
        // they will be called later through another notifier call
        // with the correct final value and in the right order
        return;
      }
      if (!subscriber._new) {
        notifySubscriber(subscriber);
      }
    }
  };
  const pauseSubscriber = (subscriber: PrivateSubscriberObject<T>) => {
    if (!subscriber._paused && !subscriber._new) {
      subscriber._paused = true;
      subscriber.pause();
    }
  };
  const notifySubscriber = (subscriber: PrivateSubscriberObject<T>) =>
    untrack(() => {
      const { changed, value } = subscriber._changeChecker();
      const wasPaused = subscriber._paused;
      subscriber._paused = false;
      subscriber._new = false;
      if (changed) {
        // the value really changed
        subscriber.next(value);
      } else if (wasPaused) {
        // the value did not change
        subscriber.resume();
      }
    });

  const oldSubscriptionsMap = new WeakMap<any, PrivateSubscriberObject<T>['_changeChecker']>();

  const res = (subscriber: Subscriber<T>): UnsubscribeFunction & UnsubscribeObject => {
    const oldSubscriptionRef = subscriber?.[oldSubscription];
    const oldSubscriptionChecker = oldSubscriptionRef
      ? oldSubscriptionsMap.get(oldSubscriptionRef)
      : null;
    const subscriberObject = toSubscriberObject(
      subscriber,
      oldSubscriptionChecker ?? changeChecker(store)
    );
    subscribers.add(subscriberObject);
    if (subscribers.size === 1) {
      watcher.watch(store);
    }
    notifySubscriber(subscriberObject);
    const unsubscribe = () => {
      const removed = subscribers.delete(subscriberObject);
      subscriberObject.next = noop;
      subscriberObject.pause = noop;
      subscriberObject.resume = noop;
      if (removed) {
        oldSubscriptionsMap.set(unsubscribe, subscriberObject._changeChecker);
        if (subscribers.size === 0) {
          watcher.unwatch(store);
          unplanNotifyStore(storeNotifier);
        }
      }
    };
    (unsubscribe as any)[triggerUpdate] = () => notifySubscriber(subscriberObject);
    unsubscribe.unsubscribe = unsubscribe;
    return unsubscribe;
  };

  normalizedSubscribe.add(res);
  return res;
};

const onUseLogic = (onUseFn: () => Unsubscriber | void) => {
  let counter = 0;
  let cleanupFn: UnsubscribeFunction | null;
  const startUse = () => {
    if (++counter === 1) {
      cleanupFn = untrack(() => normalizeUnsubscribe(onUseFn()));
    }
  };
  const endUse = () => {
    if (--counter === 0) {
      const fn = cleanupFn;
      cleanupFn = null;
      untrack(() => fn?.());
    }
  };
  const wrapCall = <T>(fn: () => T): T => {
    try {
      startUse();
      return fn();
    } finally {
      endUse();
    }
  };
  return { startUse, endUse, wrapCall };
};

class ListenerState<T> extends Signal.State<T> {
  #wrapCall: <T>(fn: () => T) => T;

  constructor(store: SubscribableStore<T>) {
    const subscriber: SubscriberFunction<T> & Partial<SubscriberObject<T>> = (value: T) =>
      batch(() => super.set(value));

    subscriber.next = subscriber;

    let unsubscribe: any;
    const { startUse, endUse, wrapCall } = onUseLogic(() => {
      unsubscribe = normalizeUnsubscribe(store.subscribe(subscriber));
      return () => {
        unsubscribe();
        (subscriber as any)[oldSubscription] = unsubscribe;
      };
    });
    super(undefined as T, {
      equals: returnFalse,
      [Signal.subtle.watched]: startUse,
      [Signal.subtle.unwatched]: endUse,
    });
    this.#wrapCall = wrapCall;
  }

  override get(): T {
    return this.#wrapCall(() => super.get());
  }
  override set() {
    throw new Error('Read-only!');
  }
}

const createSignalFromSubscribableStore = <T>(store: SubscribableStore<T>) => {
  const signal = new ListenerState(store);
  return () => signal.get();
};

const toSignalFnCache = new Map<StoreInput<any>, () => any>();
const toSignalFn = <T>(store: StoreInput<T>): (() => T) => {
  if (typeof store === 'function') {
    return () => store();
  } else if ('get' in store) {
    return () => store.get();
  }
  const subscribable = 'subscribe' in store ? store : store[symbolObservable]();
  let res = toSignalFnCache.get(subscribable);
  if (!res) {
    res = createSignalFromSubscribableStore(subscribable);
    toSignalFnCache.set(subscribable, res);
  }
  return res;
};

const toSubscribeCache = new Map();
const toSubscribe = <T>(store: StoreInput<T>): Readable<T>['subscribe'] => {
  if ('subscribe' in store) {
    return normalizeSubscribe(store);
  } else if (symbolObservable in store) {
    return normalizeSubscribe(store[symbolObservable]());
  }
  let res = toSubscribeCache.get(store);
  if (!res) {
    const storeFn = toSignalFn(store);
    // FIXME: check if it is ok to create a computed here!!
    res = createSubscribeFromSignal(new Signal.Computed(() => storeFn(), { equals: returnFalse }));
    toSubscribeCache.set(store, res);
  }
  return res;
};

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
  const needsProcessQueue = !willProcessQueueSync;
  if (needsProcessQueue) {
    willProcessQueueSync = true;
  }
  try {
    return fn();
  } finally {
    if (needsProcessQueue) {
      try {
        const storePasses = new Map<() => void, number>();
        for (const storeNotifier of syncStoresToNotifyQueue) {
          const storeCount = storePasses.get(storeNotifier) ?? 0;
          checkIterations(storeCount);
          storePasses.set(storeNotifier, storeCount + 1);
          syncStoresToNotifyQueue.delete(storeNotifier);
          // FIXME: should we catch exceptions and run remaining storeNotifiers?
          storeNotifier();
        }
      } finally {
        // FIXME: should we log an error if there are remaining items in the queue?
        syncStoresToNotifyQueue.clear();
        willProcessQueueSync = false;
      }
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
export const get = <T>(store: StoreInput<T>): T => toSignalFn(store)();

const skipEqual = Symbol();

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
  // FIXME: should we avoid exposing this with a symbol?
  protected readonly _onUseLogic = onUseLogic(() => this.onUse());
  // FIXME: should we avoid exposing this with a symbol?
  protected readonly _signal: Signal.State<T>;
  [skipEqual] = false;

  /**
   *
   * @param value - Initial value of the store
   */
  constructor(value: T) {
    this._signal = this._createSignal(value);
    this.subscribe = createSubscribeFromSignal(this._signal);
  }

  // FIXME: should we avoid exposing this with a private symbol?
  protected _createSignal(value: T): Signal.State<T> {
    return new Signal.State(value, {
      equals: (a, b) => {
        if (this[skipEqual]) {
          return false;
        }
        return this.equal(a, b);
      },
      [Signal.subtle.watched]: this._onUseLogic.startUse,
      [Signal.subtle.unwatched]: this._onUseLogic.endUse,
    });
  }

  get(): T {
    return this._onUseLogic.wrapCall(() => this._signal.get());
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
    return !equal(a, b);
  }

  /**
   * Replaces store's state with the provided value.
   * Equivalent of {@link Writable.set}, but internal to the store.
   *
   * @param value - value to be used as the new state of a store.
   */
  protected set(value: T): void {
    batch(() => {
      this._signal.set(value);
    });
  }

  /**
   * Updates store's state by using an {@link Updater} function.
   * Equivalent of {@link Writable.update}, but internal to the store.
   *
   * @param updater - a function that takes the current state as an argument and returns the new state.
   */
  protected update(updater: Updater<T>): void {
    this.set(updater(untrack(() => this._signal.get())));
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
  subscribe: Readable<T>['subscribe'];

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
 *
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
   *
   * It is called when setting a new value to avoid doing anything
   * (such as notifying subscribers) if the value did not change.
   *
   * @remarks
   * The default logic (when this option is not present) is to return false
   * if `a` is a function or an object, or if `a` and `b` are different
   * according to `Object.is`.
   *
   * {@link StoreOptions.equal|equal} takes precedence over {@link StoreOptions.notEqual|notEqual} if both
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
   *
   * It is called when setting a new value to avoid doing anything
   * (such as notifying subscribers) if the value did not change.
   *
   * @remarks
   * The default logic (when this option is not present) is to return true
   * if `a` is a function or an object, or if `a` and `b` are different
   * according to `Object.is`.
   *
   * {@link StoreOptions.equal} takes precedence over {@link StoreOptions.notEqual|notEqual} if both
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
    const next = typeof subscriber === 'function' ? subscriber : bind(subscriber, 'next');
    next(value);
    return noopUnsubscribe;
  };
  normalizedSubscribe.add(subscribe);
  return Object.assign(() => value, {
    subscribe,
    get: () => value,
    [symbolObservable]: returnThis,
  });
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
 * of that {@link StoreInput} is returned.
 *
 * If the type given as a parameter is one of an array of {@link StoreInput}, the returned type
 * is the type of an array containing the value of each store in the same order.
 */
export type StoresInputValues<S> =
  S extends StoreInput<infer T>
    ? T
    : { [K in keyof S]: S[K] extends StoreInput<infer T> ? T : never };

export type SyncDeriveFn<T, S> = (values: StoresInputValues<S>) => T;
export interface SyncDeriveOptions<T, S> extends Omit<StoreOptions<T>, 'onUse'> {
  derive: SyncDeriveFn<T, S>;
}
export type AsyncDeriveFn<T, S> = (
  values: StoresInputValues<S>,
  set: OnUseArgument<T>
) => Unsubscriber | void;
export interface AsyncDeriveOptions<T, S> extends Omit<StoreOptions<T>, 'onUse'> {
  derive: AsyncDeriveFn<T, S>;
}
type DeriveFn<T, S> = SyncDeriveFn<T, S> | AsyncDeriveFn<T, S>;
interface DeriveOptions<T, S> extends Omit<StoreOptions<T>, 'onUse'> {
  derive: DeriveFn<T, S>;
}
function isSyncDeriveFn<T, S>(fn: DeriveFn<T, S>): fn is SyncDeriveFn<T, S> {
  return fn.length <= 1;
}

export abstract class DerivedStore<T, S extends StoresInput = StoresInput> extends Store<T> {
  readonly #computedSignal: Signal.Computed<T>;

  // computed for the function param
  // with as many stores and an extra one
  constructor(stores: S, initialValue: T) {
    super(initialValue);
    const isArray = Array.isArray(stores);
    const storesSignalFn = (isArray ? [...stores] : [stores]).map(toSignalFn);
    const derivedArg = new Signal.Computed(
      isArray ? () => storesSignalFn.map((fn) => fn()) : () => storesSignalFn[0](),
      { equals: returnFalse }
    );
    let cleanupFn: null | UnsubscribeFunction = null;
    const callCleanup = () => {
      const previousCleanup = cleanupFn;
      cleanupFn = null;
      previousCleanup?.();
    };
    const callDerived = new Signal.Computed(
      () => {
        const derivedArgValue = derivedArg.get();
        untrack(() => {
          callCleanup();
          cleanupFn = normalizeUnsubscribe(this.derive(derivedArgValue as any));
        });
      },
      {
        equals: returnTrue,
        [Signal.subtle.unwatched]: callCleanup,
      }
    );
    this.#computedSignal = new Signal.Computed(
      () => {
        callDerived.get();
        return this._signal.get();
      },
      {
        equals: (a, b) => {
          if (this[skipEqual]) {
            return false;
          }
          return this.equal(a, b);
        },
      }
    );
    // FIXME: avoid assigning subscribe twice (both in parent class Store and here)
    this.subscribe = createSubscribeFromSignal(this.#computedSignal);
  }

  protected override _createSignal(value: T): Signal.State<T> {
    return new Signal.State(value, {
      // TODO: improve this because if the value does not change,
      // it still notifies all watchers depending on this signal that the value has to be checked
      // but it would be better not to do anything at all
      equals: returnFalse,
      [Signal.subtle.watched]: this._onUseLogic.startUse,
      [Signal.subtle.unwatched]: this._onUseLogic.endUse,
    });
  }

  override get(): T {
    return this._onUseLogic.wrapCall(() => this.#computedSignal.get());
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
  const Derived = isSyncDeriveFn(derive)
    ? class extends DerivedStore<T, S> {
        constructor(stores: S, initialValue: T) {
          super(stores, initialValue);
          this[skipEqual] = true; // skip call to equal until the first value is set
        }
        protected override derive(values: StoresInputValues<S>) {
          this.set(derive(values));
          this[skipEqual] = false;
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
export const untrack = Signal.subtle.untrack;

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
  { equal: optEqual, notEqual: optNotEqual }: Omit<StoreOptions<T>, 'onUse'> = {}
): ReadableSignal<T> {
  return asReadable(
    new Signal.Computed(fn, {
      equals: optEqual
        ? (a, b) => optEqual(a, b)
        : optNotEqual
          ? (a, b) => !optNotEqual(a, b)
          : equal,
    })
  );
}
