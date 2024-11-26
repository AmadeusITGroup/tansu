declare global {
  interface SymbolConstructor {
    readonly observable: symbol;
  }
}

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
 * Valid types that can be considered as a store.
 */
export type StoreInput<T> = SubscribableStore<T> | InteropObservable<T>;

/**
 * Represents a store that can return its value with a get method.
 */
export interface SignalStore<T> {
  /**
   * Returns the value of the store.
   */
  get(): T;
}

/**
 * This interface augments the base {@link SubscribableStore} interface by requiring the return value of the subscribe method to be both a function and an object with the `unsubscribe` method.
 *
 * For {@link https://rxjs.dev/api/index/interface/InteropObservable | interoperability with rxjs}, it also implements the `[Symbol.observable]` method.
 */
export interface Readable<T> extends SubscribableStore<T>, InteropObservable<T>, SignalStore<T> {
  subscribe(subscriber: Subscriber<T>): UnsubscribeFunction & UnsubscribeObject;
  [Symbol.observable](): Readable<T>;
}

/**
 * This interface augments the base {@link Readable} interface by adding the ability to call the store as a function to get its value.
 */
export interface ReadableSignal<T> extends Readable<T> {
  /**
   * Returns the value of the store.
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
