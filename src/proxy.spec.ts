import { describe, expect, it, vi } from 'vitest';
import { batch, computed, proxyStore } from './index';

describe('objects', () => {
  it('should not wrap simple values', () => {
    expect(proxyStore(1)).toBe(1);
    expect(proxyStore(NaN)).toBe(NaN);
    expect(proxyStore('a')).toBe('a');
    expect(proxyStore(true)).toBe(true);
    expect(proxyStore(false)).toBe(false);
    expect(proxyStore(null)).toBe(null);
    expect(proxyStore(undefined)).toBe(undefined);
  });

  it('should not wrap custom objects', () => {
    class MyObject {}
    const myObject = new MyObject();
    expect(proxyStore(myObject)).toBe(myObject);
  });

  it('should work in a non-reactive context', () => {
    const myStore = proxyStore({} as { value?: number });
    expect('value' in myStore).toBe(false);
    expect(myStore.value).toBe(undefined);
    expect(Object.keys(myStore)).toEqual([]);
    expect(Object.hasOwn(myStore, 'value')).toBe(false);
    myStore.value = 1;
    expect(myStore.value).toBe(1);
    expect('value' in myStore).toBe(true);
    expect(Object.keys(myStore)).toEqual(['value']);
    expect(Object.hasOwn(myStore, 'value')).toBe(true);
    myStore.value = 2;
    expect(myStore.value).toBe(2);
    delete myStore.value;
    expect(myStore.value).toBe(undefined);
    expect('value' in myStore).toBe(false);
    expect(Object.keys(myStore)).toEqual([]);
    expect(Object.hasOwn(myStore, 'value')).toBe(false);
    delete myStore.value; // does nothing
    expect(myStore.value).toBe(undefined);
  });

  it('should be reactive when adding and removing a property', () => {
    const values = [] as number[];
    const myStore = proxyStore({} as any);
    const value = computed(() => myStore.value);
    const unsubscribe = value.subscribe((value) => values.push(value));
    expect(values).toEqual([undefined]);
    myStore.value = 1;
    expect(values).toEqual([undefined, 1]);
    delete myStore.value;
    expect(values).toEqual([undefined, 1, undefined]);
    myStore.value = 2;
    expect(values).toEqual([undefined, 1, undefined, 2]);
    unsubscribe();
  });

  it('should be reactive with Object.keys', () => {
    const keysUpdates = [] as string[][];
    const myStore = proxyStore({} as any);
    const keys = computed(() => Object.keys(myStore));
    const unsubscribe = keys.subscribe((value) => keysUpdates.push(value));
    expect(keysUpdates).toEqual([[]]);
    myStore.value = 1;
    expect(keysUpdates).toEqual([[], ['value']]);
    myStore.value = 2;
    expect(keysUpdates).toEqual([[], ['value']]);
    myStore.newProp = 3;
    expect(keysUpdates).toEqual([[], ['value'], ['value', 'newProp']]);
    delete myStore.value;
    expect(keysUpdates).toEqual([[], ['value'], ['value', 'newProp'], ['newProp']]);
    myStore.value = 3;
    expect(keysUpdates).toEqual([
      [],
      ['value'],
      ['value', 'newProp'],
      ['newProp'],
      ['newProp', 'value'],
    ]);
    unsubscribe();
  });

  it('should be reactive with Object.hasOwn', () => {
    const myStore = proxyStore({} as any);
    const c = computed(() => Object.hasOwn(myStore, 'value'));
    const values = [] as boolean[];
    const unsubscribe = c.subscribe((value) => values.push(value));
    expect(values).toEqual([false]);
    myStore.value = 1;
    expect(values).toEqual([false, true]);
    delete myStore.value;
    expect(values).toEqual([false, true, false]);
    myStore.value = 1;
    expect(values).toEqual([false, true, false, true]);
    unsubscribe();
  });

  it('should be reactive with "in" operator', () => {
    const myStore = proxyStore({} as any);
    const c = computed(() => 'value' in myStore);
    const values = [] as boolean[];
    const unsubscribe = c.subscribe((value) => values.push(value));
    expect(values).toEqual([false]);
    myStore.value = 1;
    expect(values).toEqual([false, true]);
    delete myStore.value;
    expect(values).toEqual([false, true, false]);
    myStore.value = 1;
    expect(values).toEqual([false, true, false, true]);
    unsubscribe();
  });

  it('should fail with Object.preventExtensions', () => {
    const myStore = proxyStore({ value: 1 } as any);
    expect(() => {
      Object.preventExtensions(myStore);
    }).toThrow();
  });

  it('should have a prototype that cannot be replaced', () => {
    const myStore = proxyStore({} as any);
    const correctProto = Object.getPrototypeOf(myStore);
    const newProto = { hello: 1 };
    expect(() => {
      Object.setPrototypeOf(myStore, newProto);
    }).toThrow();
    expect(myStore.hello).toBe(undefined);
    expect(Object.getPrototypeOf(myStore)).toBe(correctProto);
  });

  it('should not allow defining properties', () => {
    const myStore = proxyStore({} as any);
    expect(() => {
      Object.defineProperty(myStore, 'value', { value: 1 });
    }).toThrow();
  });

  it('should not wrap proxyStore objects', () => {
    const initialValue = {};
    const myStore1 = proxyStore(initialValue);
    const myStore2 = proxyStore(myStore1);
    expect(myStore1).toBe(myStore2);
  });

  it('should copy the initial value', () => {
    const initialValue = { a: 1 };
    const myStore = proxyStore(initialValue);
    initialValue.a = 2;
    expect(myStore.a).toBe(1);
  });

  it('should wrap sub-objects on initialization', () => {
    const myStore = proxyStore({ a: { b: 1 } });
    const c = computed(() => myStore.a.b);
    const values = [] as number[];
    const unsubscribe = c.subscribe((value) => values.push(value));
    expect(values).toEqual([1]);
    myStore.a.b = 2;
    expect(values).toEqual([1, 2]);
    unsubscribe();
  });

  it('should wrap sub-objects on set', () => {
    const myStore = proxyStore({ a: { b: 0 } });
    myStore.a = { b: 1 };
    const c = computed(() => myStore.a.b);
    const values = [] as number[];
    const unsubscribe = c.subscribe((value) => values.push(value));
    expect(values).toEqual([1]);
    myStore.a.b = 2;
    expect(values).toEqual([1, 2]);
    myStore.a = { b: 3 };
    expect(values).toEqual([1, 2, 3]);
    unsubscribe();
  });

  it('should work with batch', () => {
    const person = proxyStore({
      firstName: 'Arsène',
      lastName: 'Lupin',
    });
    const fullName = computed(() => `${person.firstName} ${person.lastName}`);
    const values: string[] = [];
    const unsubscribe = fullName.subscribe((value) => values.push(value));
    batch(() => {
      person.firstName = 'Sherlock';
      person.lastName = 'Holmes';
    });
    expect(values).toEqual(['Arsène Lupin', 'Sherlock Holmes']);
    unsubscribe();
  });

  it('should not recompute when unrelated properties change', () => {
    const myState = proxyStore({ foo: [{ bar: 0 }, { bar: 1 }], y: 0 });
    const computeFn = vi.fn(() => myState.foo[0].bar + 2);
    const c = computed(computeFn);
    const values = [] as number[];
    const unsubscribe = c.subscribe((value) => values.push(value));
    expect(values).toEqual([2]);
    expect(computeFn).toHaveBeenCalledOnce();
    computeFn.mockClear();
    myState.foo[1].bar = 2;
    expect(computeFn).not.toHaveBeenCalled();
    expect(values).toEqual([2]);
    myState.foo[0].bar = 3;
    expect(values).toEqual([2, 5]);
    expect(computeFn).toHaveBeenCalledOnce();
    computeFn.mockClear();
    const previousFoo0 = myState.foo[0];
    myState.foo[0] = { bar: 4 };
    expect(values).toEqual([2, 5, 6]);
    expect(computeFn).toHaveBeenCalledOnce();
    computeFn.mockClear();
    previousFoo0.bar = 5;
    myState.foo.push({ bar: 10 });
    myState.foo.length = 1;
    myState.y = 1;
    expect(values).toEqual([2, 5, 6]);
    expect(computeFn).not.toHaveBeenCalled();
    unsubscribe();
  });
});

describe('arrays', () => {
  it('should wrap arrays', () => {
    const myStore = proxyStore([{ a: 1 }]);
    expect(Array.isArray(myStore)).toBe(true);
  });

  it('should not wrap arrays with a custom prototype', () => {
    class MyCustomArray extends Array {}
    const myArray = new MyCustomArray();
    const myStore = proxyStore(myArray);
    expect(myStore).toBe(myArray);
  });

  it('should work with push/pop', () => {
    const a = proxyStore([0, 1]);
    const length = computed(() => a.length);
    const lengthValues = [] as number[];
    const unsubscribeLength = length.subscribe((value) => lengthValues.push(value));
    const a2 = computed(() => a[2]);
    const a2Values = [] as number[];
    const unsubscribeA2 = a2.subscribe((value) => a2Values.push(value));
    expect(a2Values).toEqual([undefined]);
    expect(lengthValues).toEqual([2]);
    a.push(1);
    expect(a2Values).toEqual([undefined, 1]);
    expect(lengthValues).toEqual([2, 3]);
    a.push(2);
    expect(lengthValues).toEqual([2, 3, 4]);
    expect(a.pop()).toBe(2);
    expect(lengthValues).toEqual([2, 3, 4, 3]);
    expect(a.pop()).toBe(1);
    expect(lengthValues).toEqual([2, 3, 4, 3, 2]);
    expect(a2Values).toEqual([undefined, 1, undefined]);
    unsubscribeLength();
    unsubscribeA2();
  });

  it('should work when setting length', () => {
    const a = proxyStore([0, 1]);
    const length = computed(() => a.length);
    const lengthValues = [] as number[];
    const unsubscribeLength = length.subscribe((value) => lengthValues.push(value));
    const a2 = computed(() => a[2]);
    const a2Values = [] as number[];
    const unsubscribeA2 = a2.subscribe((value) => a2Values.push(value));
    expect(a2Values).toEqual([undefined]);
    expect(lengthValues).toEqual([2]);
    a[2] = 1;
    expect(a2Values).toEqual([undefined, 1]);
    expect(lengthValues).toEqual([2, 3]);
    a.length = 4;
    expect(lengthValues).toEqual([2, 3, 4]);
    a.length = 3;
    expect(lengthValues).toEqual([2, 3, 4, 3]);
    a.length = 2;
    expect(lengthValues).toEqual([2, 3, 4, 3, 2]);
    expect(a2Values).toEqual([undefined, 1, undefined]);
    unsubscribeLength();
    unsubscribeA2();
  });

  it('should fail to delete the length property', () => {
    const a = proxyStore([0, 1]);
    expect(() => {
      delete (a as any).length;
    }).toThrow();
  });

  it('should work with Object.keys', () => {
    const a = proxyStore([2, 3]);
    const keys = computed(() => Object.keys(a));
    const keysValues = [] as string[][];
    const unsubscribeKeys = keys.subscribe((value) => keysValues.push(value));
    expect(keysValues).toEqual([['0', '1']]);
    a.unshift(4);
    expect(keysValues).toHaveLength(2);
    expect(keysValues[1]).toEqual(['0', '1', '2']);
    expect(a.pop()).toBe(3);
    expect(keysValues).toHaveLength(3);
    expect(keysValues[2]).toEqual(['0', '1']);
    a.length = 6;
    expect(keysValues).toHaveLength(3);
    unsubscribeKeys();
    delete a[0];
    a[5] = 9;
    expect(keys()).toEqual(['1', '5']);
  });
});
