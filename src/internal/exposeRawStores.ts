import type { Readable, ReadableSignal, StoreInput } from '../types';
import type { RawStore } from './store';
import { RawSubscribableWrapper } from './storeSubscribable';

/**
 * Symbol used in {@link InteropObservable} allowing any object to expose an observable.
 */
export const symbolObservable: typeof Symbol.observable =
  (typeof Symbol === 'function' && Symbol.observable) || ('@@observable' as any);

const returnThis = function <T>(this: T): T {
  return this;
};

export const rawStoreSymbol = Symbol();
const rawStoreMap = new WeakMap<StoreInput<any>, RawStore<any>>();

export const getRawStore = <T>(storeInput: StoreInput<T>): RawStore<T> => {
  const rawStore = (storeInput as any)[rawStoreSymbol];
  if (rawStore) {
    return rawStore;
  }
  let res = rawStoreMap.get(storeInput);
  if (!res) {
    let subscribable = storeInput;
    if (!('subscribe' in subscribable)) {
      subscribable = subscribable[symbolObservable]();
    }
    res = new RawSubscribableWrapper(subscribable);
    rawStoreMap.set(storeInput, res);
  }
  return res;
};

export const exposeRawStore = <T, U>(
  rawStore: RawStore<T>,
  extraProp?: U
): ReadableSignal<T> & Omit<U, keyof Readable<T>> => {
  const get = rawStore.get.bind(rawStore) as any;
  if (extraProp) {
    Object.assign(get, extraProp);
  }
  get.get = get;
  get.subscribe = rawStore.subscribe.bind(rawStore);
  get[symbolObservable] = returnThis;
  get[rawStoreSymbol] = rawStore;
  return get;
};
