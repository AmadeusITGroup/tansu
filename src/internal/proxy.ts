import { batch } from './batch';
import { RawStoreComputed } from './storeComputed';
import { RawStoreWritable } from './storeWritable';
import { activeConsumer } from './untrack';

const returnFalse = () => false;
const arrayEquals = <T>(a: T[], b: T[]) => {
  const aLength = a.length;
  if (aLength !== b.length) {
    return false;
  }
  for (let i = 0; i < aLength; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
};

const objectProto = Object.prototype;
const arrayProto = Array.prototype;

class TansuArrayStore extends Array {}
class TansuObjectStore {}

const wrapInBatch = <T, U extends any[], V>(originalFn: (this: T, ...args: U) => V) =>
  function (this: T, ...args: U) {
    return batch(() => originalFn.call(this, ...args));
  };

const tansuArrayProto = TansuArrayStore.prototype;
for (const fnName of ['fill', 'pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift']) {
  const fn = (arrayProto as any)[fnName];
  if (typeof fn === 'function') {
    (tansuArrayProto as any)[fnName] = wrapInBatch(fn);
  }
}

type KeyInfo<T = unknown> = {
  store: RawStoreWritable<T | undefined>;
  existsStore: RawStoreWritable<boolean>;
  config: PropertyDescriptor;
};

const createProxyStore = <T extends object>(initialValue: T): T => {
  const isArray = Array.isArray(initialValue);
  const constructor: any = isArray ? TansuArrayStore : TansuObjectStore;
  const proto = constructor.prototype;
  const proxyTarget = new constructor();

  for (const key of Reflect.ownKeys(initialValue)) {
    proxyTarget[key] = proxyStore((initialValue as any)[key]);
  }

  const proxyTarget$ = new RawStoreWritable(proxyTarget);
  proxyTarget$.equalFn = returnFalse;
  const keysInfo: Record<string | symbol, Partial<KeyInfo<any>>> = Object.create(null);
  let length: RawStoreComputed<number> | undefined;
  let ownKeys: RawStoreComputed<(string | symbol)[]> | undefined;

  const getKeyInfo = (key: string | symbol) => {
    let keyInfo = keysInfo[key];
    if (!keyInfo) {
      keyInfo = {};
      keysInfo[key] = keyInfo;
    }
    return keyInfo;
  };

  const getKeyInfoWithStore = (key: string | symbol) => {
    const keyInfo: Partial<KeyInfo> = getKeyInfo(key);
    let store = keyInfo.store;
    if (!store) {
      store = new RawStoreWritable(proxyTarget[key]);
      store.equalFn = Object.is;
      keyInfo.store = store;
    }
    return keyInfo as Pick<KeyInfo, 'store'> & Partial<KeyInfo>;
  };

  const removeKey = (key: string | symbol) =>
    batch(() => {
      if (Object.hasOwn(proxyTarget, key)) {
        delete proxyTarget[key];
        proxyTarget$.set(proxyTarget);
      }
      const keyInfo = keysInfo[key];
      keyInfo?.store?.set(undefined);
      keyInfo?.existsStore?.set(false);
    });

  const reactiveExists = (key: string | symbol, keyInfo = getKeyInfo(key)) => {
    let existsStore = keyInfo.existsStore;
    if (!existsStore) {
      existsStore = new RawStoreWritable(Object.hasOwn(proxyTarget, key));
      keyInfo.existsStore = existsStore;
    }
    return existsStore.get();
  };

  const setValue = (key: string | symbol, value: unknown) =>
    batch(() => {
      value = proxyStore(value);
      const existsValue = Object.hasOwn(proxyTarget, key);
      proxyTarget[key] = value;
      const keyInfo = keysInfo[key];
      if (!existsValue) {
        proxyTarget$.set(proxyTarget);
        keyInfo?.existsStore?.set(true);
      }
      keyInfo?.store?.set(value);
    });

  const getValue = (key: string | symbol) => {
    if (!activeConsumer) {
      // quick path
      return proxyTarget[key];
    }
    if (isArray && key === 'length') {
      if (!length) {
        length = new RawStoreComputed(() => proxyTarget$.get().length);
      }
      return length.get();
    }
    return getKeyInfoWithStore(key).store.get() ?? proto[key];
  };

  return new Proxy(proxyTarget as T, {
    get(target, key) {
      return getValue(key);
    },
    set(target, key, value) {
      if (isArray && key === 'length') {
        batch(() => {
          const prevLength = proxyTarget.length;
          proxyTarget.length = value;
          const newLength = proxyTarget.length;
          if (newLength !== prevLength) {
            proxyTarget$.set(proxyTarget);
          }
          for (let i = newLength; i < prevLength; i++) {
            removeKey(`${i}`);
          }
        });
        return true;
      }
      setValue(key, value);
      return true;
    },
    deleteProperty(target, key) {
      if (isArray && key === 'length') {
        return false;
      }
      removeKey(key);
      return true;
    },
    has(target, key) {
      if (!activeConsumer) {
        // quick path
        return key in proxyTarget;
      }
      return reactiveExists(key) || key in proto;
    },
    ownKeys() {
      if (!ownKeys) {
        ownKeys = new RawStoreComputed(() => Reflect.ownKeys(proxyTarget$.get()));
        ownKeys.equalFn = arrayEquals;
      }
      return [...ownKeys.get()];
    },
    getOwnPropertyDescriptor(target, key) {
      if (!activeConsumer || (isArray && key === 'length')) {
        return Reflect.getOwnPropertyDescriptor(proxyTarget, key);
      }
      const keyInfo = getKeyInfo(key);
      if (!reactiveExists(key, keyInfo)) {
        return undefined;
      }
      let config = keyInfo.config;
      if (!keyInfo.config) {
        config = {
          configurable: true,
          enumerable: true,
          get: getValue.bind(null, key),
          set: setValue.bind(null, key),
        };
        keyInfo.config = config;
      }
      return config;
    },
    // unsupported features:
    preventExtensions() {
      return false;
    },
    defineProperty() {
      return false;
    },
    setPrototypeOf() {
      return false;
    },
  });
};

/**
 * Create a {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy|Proxy} object
 * which recursively implements each of its properties as a Tansu store.
 *
 * @example
 * ```ts
 * const myStore = proxyStore({ a: 1, b: 2 });
 * const aTimesB = computed(() => myStore.a * myStore.b);
 * aTimesB.subscribe((value) => console.log(value)); // logs: 2
 * myStore.a = 2; // logs: 4
 * myStore.b = 3; // logs: 6
 * ```
 *
 * @param initialValue - The initial value of the object. It is copied and wrapped in Tansu stores.
 * @returns The proxy store object.
 */
export const proxyStore = <T>(initialValue: T): T => {
  if (typeof initialValue !== 'object' || initialValue == null) {
    return initialValue;
  }
  const proto = Object.getPrototypeOf(initialValue);
  if (proto === objectProto || proto === arrayProto) {
    return createProxyStore(initialValue);
  }
  return initialValue;
};
