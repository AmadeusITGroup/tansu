import {
  derived,
  DerivedStore,
  Store,
  SubscribableStore,
  writable,
  get,
  readable,
  batch,
} from './index';
import { from } from 'rxjs';
import { Component, Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';

describe('stores', () => {
  describe('base', () => {
    it('should accept initial value and expose it to subscribers', () => {
      class BasicStore extends Store<string> {}
      const store = new BasicStore('Hello, World');

      let defValue: undefined | string;
      store.subscribe((v) => (defValue = v));

      expect(defValue).toBe('Hello, World');
    });

    it('should expose protected methods of setting and updating state', () => {
      class CounterStore extends Store<number> {
        constructor() {
          super(0);
        }

        increment() {
          this.update((v) => v + 1);
        }

        decrement() {
          this.update((v) => v - 1);
        }

        reset() {
          this.set(0);
        }
      }

      const store = new CounterStore();

      let value: undefined | number;
      store.subscribe((v) => (value = v));

      expect(value).toBe(0);

      store.increment();
      store.increment();
      expect(value).toBe(2);

      store.decrement();
      expect(value).toBe(1);

      store.reset();
      expect(value).toBe(0);
    });

    it('should expose utility function get the latest value', () => {
      class BasicStore extends Store<number> {}
      const store = new BasicStore(5);
      expect(get(store)).toBe(5);
    });

    it('should expose onUse callback invoked on first subscriber registration', () => {
      let firstSubscribeCount = 0;

      class TestStore extends Store<number> {
        constructor() {
          super(0);
        }

        onUse() {
          firstSubscribeCount++;
        }
      }

      const testSubscriber = () => {};

      const testStore = new TestStore();
      expect(firstSubscribeCount).toBe(0);

      const unsubscribe1 = testStore.subscribe(testSubscriber);
      expect(firstSubscribeCount).toBe(1);

      const unsubscribe2 = testStore.subscribe(testSubscriber);
      expect(firstSubscribeCount).toBe(1);

      unsubscribe1();
      unsubscribe2();
      expect(firstSubscribeCount).toBe(1);

      testStore.subscribe(testSubscriber);
      expect(firstSubscribeCount).toBe(2);
    });

    it('should process function returned from onUse when the last subscriber is removed', () => {
      const counters = { sub: 0, unsub: 0 };
      class TestStore extends Store<number> {
        constructor() {
          super(0);
        }

        onUse() {
          counters.sub++;
          return () => counters.unsub++;
        }
      }

      const testSubscriber = () => {};

      const testStore = new TestStore();
      expect(counters).toEqual({ sub: 0, unsub: 0 });

      const unsubscribe1 = testStore.subscribe(testSubscriber);
      const unsubscribe2 = testStore.subscribe(testSubscriber);
      expect(counters).toEqual({ sub: 1, unsub: 0 });

      unsubscribe1();
      expect(counters).toEqual({ sub: 1, unsub: 0 });

      unsubscribe2();
      expect(counters).toEqual({ sub: 1, unsub: 1 });
    });

    it('should notify with the value set in onUse to the first subscriber', () => {
      class MyStore extends Store<string> {
        onUse() {
          this.set('from onUse');
        }

        update() {
          this.set('updated');
        }
      }

      const store = new MyStore('initial');

      const values: string[] = [];
      store.subscribe((v) => values.push(v));

      // notice that the first subscriber never gets the initial value but rather gets notified with a value set in the onUse callback
      expect(values).toEqual(['from onUse']);

      store.update();
      expect(values).toEqual(['from onUse', 'updated']);
    });

    it('should stop subscriber notification on unsubscribe', () => {
      class TickStore extends Store<number> {
        constructor() {
          super(0);
        }

        tick() {
          this.update((n) => n + 1);
        }
      }

      const store = new TickStore();
      let value: undefined | number;
      const unsubscribe = store.subscribe((v) => (value = v));

      expect(value).toBe(0);

      store.tick();
      expect(value).toBe(1);

      unsubscribe();
      store.tick();
      expect(value).toBe(1);
    });

    it('should not unsubscribe another listener when calling unsubscribe twice (function signature)', () => {
      const store = writable(0);
      const values: number[] = [];
      const listener = (value: number) => values.push(value);
      const unsubscribe1 = store.subscribe(listener);
      expect(values).toEqual([0]);
      const unsubscribe2 = store.subscribe(listener);
      expect(values).toEqual([0, 0]);
      store.set(1);
      expect(values).toEqual([0, 0, 1, 1]);
      unsubscribe1();
      store.set(2);
      expect(values).toEqual([0, 0, 1, 1, 2]);
      unsubscribe1(); // should do nothing as unsubscribe1 was already called
      store.set(3);
      expect(values).toEqual([0, 0, 1, 1, 2, 3]);
      unsubscribe2();
      store.set(4);
      expect(values).toEqual([0, 0, 1, 1, 2, 3]);
    });

    it('should not unsubscribe another listener when calling unsubscribe twice (object signature)', () => {
      const store = writable(0);
      const values: number[] = [];
      const listener = { next: (value: number) => values.push(value) };
      const unsubscribe1 = store.subscribe(listener);
      expect(values).toEqual([0]);
      const unsubscribe2 = store.subscribe(listener);
      expect(values).toEqual([0, 0]);
      store.set(1);
      expect(values).toEqual([0, 0, 1, 1]);
      unsubscribe1();
      store.set(2);
      expect(values).toEqual([0, 0, 1, 1, 2]);
      unsubscribe1(); // should do nothing as unsubscribe1 was already called
      store.set(3);
      expect(values).toEqual([0, 0, 1, 1, 2, 3]);
      unsubscribe2();
      store.set(4);
      expect(values).toEqual([0, 0, 1, 1, 2, 3]);
    });

    it('should expose a working unsubscribe method on the object returned from subscribe', () => {
      const store = writable(0);
      const values: number[] = [];
      const unsubscribe = store.subscribe((a) => values.push(a));
      expect(values).toEqual([0]);
      store.set(1);
      expect(values).toEqual([0, 1]);
      unsubscribe.unsubscribe(); // call unsubscribe as rxjs would do
      store.set(2);
      expect(values).toEqual([0, 1]); // unsubscribe worked, value 2 was not received
    });

    it('should work when changing a store in the listener of the store', () => {
      const store = writable(0);
      const calls: number[] = [];
      const unsubscribe = store.subscribe((n) => {
        calls.push(n);
        if (n < 10) {
          store.set(n + 1);
        }
      });
      expect(calls).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      expect(get(store)).toEqual(10);
      unsubscribe();
    });

    it('should not call again listeners when only resuming subscribers', () => {
      class BasicStore extends Store<object> {
        public pauseSubscribers(): void {
          super.pauseSubscribers();
        }
        public resumeSubscribers(): void {
          super.resumeSubscribers();
        }
        public set(value: object): void {
          super.set(value);
        }
      }
      const initialValue = {};
      const newValue = {};
      const store = new BasicStore(initialValue);
      const calls: object[] = [];
      const unsubscribe = store.subscribe((v) => calls.push(v));
      expect(calls.length).toBe(1);
      expect(calls[0]).toBe(initialValue);
      store.pauseSubscribers();
      store.resumeSubscribers();
      expect(calls.length).toBe(1);
      store.set(newValue);
      expect(calls.length).toBe(2);
      expect(calls[1]).toBe(newValue);
      unsubscribe();
    });

    it('should be compatible with rxjs "from" (writable)', () => {
      const store = writable(0);
      const observable = from(store);
      const values: number[] = [];
      const subscription = observable.subscribe((value) => values.push(value));
      expect(values).toEqual([0]);
      store.set(1);
      expect(values).toEqual([0, 1]);
      subscription.unsubscribe();
      store.set(2);
      expect(values).toEqual([0, 1]);
    });

    it('should be compatible with rxjs "from" (Store class)', () => {
      class TickStore extends Store<number> {
        constructor() {
          super(0);
        }

        tick() {
          this.update((n) => n + 1);
        }
      }
      const store = new TickStore();
      const observable = from(store);
      const values: number[] = [];
      const subscription = observable.subscribe((value) => values.push(value));
      expect(values).toEqual([0]);
      store.tick();
      expect(values).toEqual([0, 1]);
      subscription.unsubscribe();
      store.tick();
      expect(values).toEqual([0, 1]);
    });

    it('should stop subscriber notification on store destroy', () => {
      class TickStore extends Store<number> {
        constructor() {
          super(0);
        }

        tick() {
          this.update((n) => n + 1);
        }
      }

      const store = new TickStore();
      let value: undefined | number;
      store.subscribe((v) => (value = v));

      expect(value).toBe(0);

      store.tick();
      expect(value).toBe(1);

      store.ngOnDestroy();
      store.tick();
      expect(value).toBe(1);
    });

    it('should work with AsyncPipe', () => {
      @Component({
        template: `Value: {{ store | async }}`,
      })
      class MyComponent {
        store = writable(0);
      }
      TestBed.configureTestingModule({
        declarations: [MyComponent],
      });
      const fixture = TestBed.createComponent(MyComponent);
      const componentInstance = fixture.componentInstance;
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('Value: 0');
      componentInstance.store.set(1);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('Value: 1');
      fixture.destroy();
    });

    it('should call ngOnDestroy when injected class extending Store is destroyed', () => {
      @Injectable()
      class MyStore extends Store<number> {
        constructor() {
          super(0);
        }
        increment() {
          this.update((value) => value + 1);
        }
      }

      @Component({
        template: `Value: {{ store | async }}`,
        providers: [MyStore],
      })
      class MyComponent {
        constructor(public store: MyStore) {}
      }

      TestBed.configureTestingModule({
        declarations: [MyComponent],
      });
      const fixture = TestBed.createComponent(MyComponent);
      const componentInstance = fixture.componentInstance;
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('Value: 0');
      componentInstance.store.increment();
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('Value: 1');
      const spySubscriberClear = spyOn(
        (componentInstance.store as any)._subscribers as Set<any>,
        'clear'
      );
      fixture.destroy();
      expect(spySubscriberClear).toHaveBeenCalled();
    });
  });

  describe('readable shorthand', () => {
    it('should expose readable store creation function', () => {
      const one = readable(1);
      expect(get(one)).toBe(1);
    });

    it('should accept a function with a value setter in the readable store shorthand', () => {
      let tick!: (val: number) => void;
      const ticker = readable(0, (set) => {
        tick = set;
      });

      expect(get(ticker)).toBe(0);

      tick(1);
      expect(get(ticker)).toBe(1);

      tick(2);
      expect(get(ticker)).toBe(2);
    });

    it('should use the provided function as the onUse hook', () => {
      let callCounter = 0;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const readableWithSet = readable(0, (set) => {
        callCounter++;
        return () => {
          callCounter--;
        };
      });

      // so subscribers, provided function is not called
      expect(callCounter).toBe(0);

      // first subscriber - function called
      const unSub1 = readableWithSet.subscribe(() => {});
      expect(callCounter).toBe(1);

      // next subscriber - function NOT called
      const unSub2 = readableWithSet.subscribe(() => {});
      expect(callCounter).toBe(1);

      // unregistering subscriber but still one left - cleanup fn NOT called
      unSub2();
      expect(callCounter).toBe(1);

      // unregistering last subscriber - cleanup fn called
      unSub1();
      expect(callCounter).toBe(0);
    });

    it('should give access to both set and update function in the second argument of the readable shorthand', () => {
      const store = readable(-1, ({ set, update }) => {
        set(0);
        update((v) => v + 1);
      });

      expect(get(store)).toBe(1);
    });

    it('should be able to use destructuring', () => {
      const store = readable(0);
      const { subscribe } = store;

      const values: Array<number> = [];
      const unsubscribe = subscribe((v) => values.push(v));
      expect(values).toEqual([0]);

      unsubscribe();
    });
  });

  describe('writable', () => {
    it('should expose quick store creation function', () => {
      const counter = writable(0);
      expect(get(counter)).toBe(0);

      counter.update((c) => c + 1);
      expect(get(counter)).toBe(1);

      counter.set(0);
      expect(get(counter)).toBe(0);
    });

    it('should accept onUse hook function', () => {
      const store = writable(-1, ({ set, update }) => {
        set(0);
        update((v) => v + 1);
      });

      expect(get(store)).toBe(1);
    });

    // https://github.com/sveltejs/svelte/blob/84ac3a53d53a84194cd9f121a27809a60764d6fc/test/store/index.js
    it('should not assume immutable data', () => {
      const obj = {};
      let called = 0;

      const store = writable(obj);

      store.subscribe(() => {
        called += 1;
      });

      store.set(obj);
      expect(called).toBe(2);

      store.update((obj) => obj);
      expect(called).toBe(3);
    });

    it('should not emit when a primitive value does not change', () => {
      const values: any[] = [];
      const numStore = writable(5);
      const strStore = writable('foo');
      const boolStore = writable(true);
      const undefinedStore = writable(undefined);

      numStore.subscribe((v) => values.push(v));
      strStore.subscribe((v) => values.push(v));
      boolStore.subscribe((v) => values.push(v));
      undefinedStore.subscribe((v) => values.push(v));
      expect(values).toEqual([5, 'foo', true, undefined]);

      numStore.set(5);
      strStore.set('foo');
      boolStore.set(true);
      undefinedStore.set(undefined);
      expect(values).toEqual([5, 'foo', true, undefined]);
    });

    it('should not emit when setting NaN', () => {
      const values: any[] = [];
      const numStore = writable(NaN);

      numStore.subscribe((v) => values.push(v));
      expect(values).toEqual([NaN]);

      numStore.set(NaN);
      expect(values).toEqual([NaN]);
    });

    it('should be able to use destructuring', () => {
      const store = writable(0);
      const { subscribe, set: setValue, update: updateValue } = store;

      setValue(1);
      expect(get(store)).toBe(1);

      updateValue(() => {
        return 2;
      });
      expect(get(store)).toBe(2);

      const values: Array<number> = [];
      const unsubscribe = subscribe((v) => values.push(v));
      expect(values).toEqual([2]);

      unsubscribe();
    });
  });

  describe('derived', () => {
    it('should derive from one store', () => {
      const numbersStore = writable(0);

      class MultiplyBy2Store extends DerivedStore<number, SubscribableStore<number>> {
        constructor() {
          super(numbersStore, 0);
        }

        derive(value: number) {
          this.set(value * 2);
        }
      }

      const multiplyStore = new MultiplyBy2Store();

      expect(get(multiplyStore)).toBe(0);

      numbersStore.set(5);
      expect(get(multiplyStore)).toBe(10);

      numbersStore.set(7);
      expect(get(multiplyStore)).toBe(14);
    });

    it('should expose derived shorthand', () => {
      const numbersStore = writable(0);
      const multiplyStore = derived([numbersStore], (values) => values[0] * 2);

      expect(get(multiplyStore)).toBe(0);

      numbersStore.set(5);
      expect(get(multiplyStore)).toBe(10);

      numbersStore.set(7);
      expect(get(multiplyStore)).toBe(14);
    });

    it('should properly support unsubscribing', () => {
      const counter = writable(0);
      const multiply = derived([counter], ([val]) => 2 * val);

      const values: number[] = [];
      const unsubscribe = multiply.subscribe((v) => values.push(v));

      expect(values).toEqual([0]);

      unsubscribe();
      counter.set(1);
      expect(values).toEqual([0]);
    });

    it('should have convenient signature for single source', () => {
      const counter = writable(0);
      const multiply = derived(counter, (val) => 2 * val);

      const values: number[] = [];
      const unsubscribe = multiply.subscribe((v) => {
        values.push(v);
      });

      expect(values).toEqual([0]);

      counter.update((c) => c + 1);
      expect(values).toEqual([0, 2]);

      unsubscribe();
      counter.update((c) => c + 1);
      expect(values).toEqual([0, 2]);
    });

    it('should only call deriveFn when there is a subscriber', () => {
      const a = writable(2);
      const deriveFn = jasmine.createSpy('deriveFn', (a) => a * 2).and.callThrough();
      const b = derived(a, deriveFn);
      expect(deriveFn).not.toHaveBeenCalled();
      const values: number[] = [];
      let unsubscribe = b.subscribe((b) => values.push(b));
      expect(deriveFn).toHaveBeenCalledTimes(1);
      expect(deriveFn).toHaveBeenCalledWith(2);
      deriveFn.calls.reset();
      expect(values).toEqual([4]);
      unsubscribe();
      a.set(5);
      expect(deriveFn).not.toHaveBeenCalled();
      expect(values).toEqual([4]);
      unsubscribe = b.subscribe((b) => values.push(b));
      expect(deriveFn).toHaveBeenCalledTimes(1);
      expect(deriveFn).toHaveBeenCalledWith(5);
      expect(values).toEqual([4, 10]);
      unsubscribe();
    });

    // https://github.com/sveltejs/svelte/blob/84ac3a53d53a84194cd9f121a27809a60764d6fc/test/store/index.js#L148
    it('should derive from multiple stores', () => {
      const a = writable(2);
      const b = writable(3);
      const c = derived([a, b], ([a, b]) => a * b);

      const values: number[] = [];

      const unsubscribe = c.subscribe((value) => {
        values.push(value);
      });

      a.set(4);
      b.set(5);
      expect(values).toEqual([6, 12, 20]);

      unsubscribe();

      a.set(6);
      expect(values).toEqual([6, 12, 20]);
    });

    it('should derive from multiple stores with values of different type', () => {
      const str = writable('Hi!');
      const num = writable(2);

      const repeat = derived([str, num], ([s, n]) => s.repeat(n));
      expect(get(repeat)).toBe('Hi!Hi!');
    });

    it('should prevent the diamond dependency problem', () => {
      const a = writable(0);
      const b = derived(a, (a) => `b${a}`);
      const c = derived(a, (a) => `c${a}`);
      const dFn = jasmine.createSpy('dFn', ([b, c]) => `${b}${c}`).and.callThrough();
      const d = derived([b, c], dFn);

      const values: string[] = [];

      const unsubscribe = d.subscribe((value) => {
        values.push(value);
      });
      expect(dFn).toHaveBeenCalledTimes(1);
      expect(values).toEqual(['b0c0']);
      a.set(1);
      expect(dFn).toHaveBeenCalledTimes(2);
      expect(values).toEqual(['b0c0', 'b1c1']);
      unsubscribe();
    });

    it('should prevent the asymmetric diamond dependency problem', () => {
      const a = writable(0);
      const b = derived(a, (a) => `b${a}`);
      const cFn = jasmine.createSpy('cFn', ([a, b]) => `${a}${b}`).and.callThrough();
      const c = derived([a, b], cFn);

      const values: string[] = [];

      const unsubscribe = c.subscribe((value) => {
        values.push(value);
      });
      expect(cFn).toHaveBeenCalledTimes(1);
      expect(values).toEqual(['0b0']);
      a.set(1);
      expect(cFn).toHaveBeenCalledTimes(2);
      expect(values).toEqual(['0b0', '1b1']);
      unsubscribe();
    });

    it('should be able to use destructuring', () => {
      const store = writable(0);
      const derivedStore = derived(store, (value) => {
        return value + 1;
      });
      const { subscribe } = derivedStore;

      const values: Array<number> = [];
      const unsubscribe = subscribe((v) => values.push(v));
      expect(values).toEqual([1]);

      unsubscribe();
    });

    it('should work with DebounceStore example', () => {
      class DebounceStore<T> extends DerivedStore<T, SubscribableStore<T>> {
        constructor(store: SubscribableStore<T>, initialValue: T, private _delay: number) {
          super(store, initialValue);
        }
        protected derive(value: T) {
          const timeout = setTimeout(() => this.set(value), this._delay);
          return () => clearTimeout(timeout);
        }
      }
      const clock = jasmine.clock();
      clock.uninstall();
      clock.withMock(() => {
        const a = writable(1);
        const b = new DebounceStore(a, 0, 100);
        const values: number[] = [];
        const unsubscribe = b.subscribe((value) => values.push(value));
        expect(values).toEqual([0]);
        clock.tick(99);
        expect(values).toEqual([0]);
        clock.tick(1);
        expect(values).toEqual([0, 1]);
        a.set(2);
        clock.tick(1);
        a.set(3);
        clock.tick(99);
        expect(values).toEqual([0, 1]);
        clock.tick(1);
        expect(values).toEqual([0, 1, 3]);
        unsubscribe();
      });
    });

    it('should call clean-up function returned in deriveFn with derived', () => {
      const a = writable(1);
      const cleanUpFn = jasmine.createSpy('cleanupFn').and.callThrough();
      const deriveFn = jasmine
        .createSpy('deriveFn', (value: number, set: (a: number) => void) => {
          set(value * 2);
          return () => cleanUpFn(value);
        })
        .and.callThrough();
      const b = derived(a, deriveFn, 0);
      const values: number[] = [];
      expect(deriveFn).not.toHaveBeenCalled();
      const unsubscribe = b.subscribe((value) => values.push(value));
      expect(values).toEqual([2]);
      expect(deriveFn).toHaveBeenCalledTimes(1);
      deriveFn.calls.reset();
      expect(cleanUpFn).not.toHaveBeenCalled();
      a.set(3);
      expect(values).toEqual([2, 6]);
      expect(deriveFn).toHaveBeenCalledTimes(1);
      deriveFn.calls.reset();
      expect(cleanUpFn).toHaveBeenCalledWith(1);
      expect(cleanUpFn).toHaveBeenCalledTimes(1);
      cleanUpFn.calls.reset();
      unsubscribe();
      expect(deriveFn).not.toHaveBeenCalled();
      expect(cleanUpFn).toHaveBeenCalledTimes(1);
      expect(cleanUpFn).toHaveBeenCalledWith(3);
    });
  });

  describe('batch', () => {
    it('should work with two writables and a derived', () => {
      const firstName = writable('Arsène');
      const lastName = writable('Lupin');
      const fullName = derived([firstName, lastName], ([a, b]) => `${a} ${b}`);
      const values: string[] = [];
      const unsubscribe = fullName.subscribe((value) => values.push(value));
      const expectedRes = {};
      const res = batch(() => {
        firstName.set('Sherlock');
        lastName.set('Holmes');
        return expectedRes;
      });
      expect(values).toEqual(['Arsène Lupin', 'Sherlock Holmes']);
      expect(res).toBe(expectedRes);
      unsubscribe();
    });

    it('should not call listeners multiple times', () => {
      const store = writable(0);
      const calls: number[] = [];
      const unsubscribe = store.subscribe((n) => calls.push(n));
      expect(calls).toEqual([0]);
      batch(() => {
        store.set(1);
        store.set(2);
        expect(calls).toEqual([0]);
      });
      expect(calls).toEqual([0, 2]);
      unsubscribe();
    });

    it('should allow nested calls', () => {
      const store = writable(0);
      const calls: number[] = [];
      const unsubscribe = store.subscribe((n) => calls.push(n));
      expect(calls).toEqual([0]);
      batch(() => {
        store.set(1);
        store.set(2);
        batch(() => {
          store.set(3);
          store.set(4);
        });
        store.set(5);
        batch(() => {
          store.set(6);
          store.set(7);
        });
        expect(calls).toEqual([0]);
      });
      expect(calls).toEqual([0, 7]);
      unsubscribe();
    });

    it('should still call multiple times the listeners registered multiple times', () => {
      const store = writable(0);
      const calls: number[] = [];
      const fn = (n: number) => calls.push(n);
      const unsubscribe1 = store.subscribe(fn);
      const unsubscribe2 = store.subscribe(fn);
      expect(calls).toEqual([0, 0]);
      batch(() => {
        store.set(1);
        store.set(2);
        expect(calls).toEqual([0, 0]);
      });
      expect(calls).toEqual([0, 0, 2, 2]);
      unsubscribe1();
      unsubscribe2();
    });

    it('should not call pause multiple times', () => {
      const store = writable(0);
      let pauseCalls = 0;
      const unsubscribe = store.subscribe({
        next: () => {},
        pause: () => {
          pauseCalls++;
        },
      });
      expect(pauseCalls).toEqual(0);
      batch(() => {
        expect(pauseCalls).toEqual(0);
        store.set(1);
        expect(pauseCalls).toEqual(1);
        store.set(2);
        expect(pauseCalls).toEqual(1);
      });
      expect(pauseCalls).toEqual(1);
      unsubscribe();
    });

    it('should not call again listeners when the value finally did not change', () => {
      const a = writable(0);
      const values: number[] = [];
      const unsubscribe = a.subscribe((value) => {
        values.push(value);
      });
      expect(values).toEqual([0]);
      batch(() => {
        a.set(0);
        expect(get(a)).toEqual(0);
        a.set(1);
        expect(get(a)).toEqual(1);
        a.set(0);
        expect(get(a)).toEqual(0);
      });
      expect(values).toEqual([0]);
      expect(get(a)).toEqual(0);
      batch(() => {
        a.set(1);
        expect(get(a)).toEqual(1);
        a.set(0);
        expect(get(a)).toEqual(0);
        a.set(1);
        expect(get(a)).toEqual(1);
        expect(values).toEqual([0]);
      });
      expect(values).toEqual([0, 1]);
      expect(get(a)).toEqual(1);
      unsubscribe();
    });

    it('should not call again listeners when the original value finally did not change with a derived', () => {
      const a = writable(0);
      const b = derived(a, (a) => a + 1);
      const values: number[] = [];
      const unsubscribe = b.subscribe((value) => {
        values.push(value);
      });
      expect(values).toEqual([1]);
      batch(() => {
        a.set(0);
        expect(get(b)).toEqual(1);
        a.set(1);
        expect(get(b)).toEqual(1); // batch prevents the current value from being computed
        a.set(0);
        expect(get(b)).toEqual(1);
      });
      expect(values).toEqual([1]);
      expect(get(b)).toEqual(1);
      batch(() => {
        a.set(1);
        expect(get(b)).toEqual(1); // batch prevents the current value from being computed
        a.set(0);
        expect(get(b)).toEqual(1);
        a.set(1);
        expect(get(b)).toEqual(1); // batch prevents the current value from being computed
        expect(values).toEqual([1]);
      });
      expect(values).toEqual([1, 2]);
      expect(get(b)).toEqual(2);
      unsubscribe();
    });

    it('should not call again listeners when the derived value finally did not change', () => {
      const a = writable(0);
      const isEven = derived(a, (a) => a % 2 === 0);
      const values: boolean[] = [];
      const unsubscribe = isEven.subscribe((value) => {
        values.push(value);
      });
      expect(values).toEqual([true]);
      expect(get(isEven)).toEqual(true);
      batch(() => {
        a.set(0); // isEven = true
        expect(get(isEven)).toEqual(true);
        a.set(1); // isEven = false (without batch)
        expect(get(isEven)).toEqual(true); // batch prevents the current value from being computed
        a.set(2); // isEven = true again
        expect(get(isEven)).toEqual(true);
      });
      expect(values).toEqual([true]);
      expect(get(isEven)).toEqual(true);
      batch(() => {
        a.set(3); // isEven = false (without batch)
        expect(get(isEven)).toEqual(true); // batch prevents the current value from being computed
        a.set(4); // isEven = true
        expect(get(isEven)).toEqual(true);
        a.set(5); // isEven = false
        expect(get(isEven)).toEqual(true);
        expect(values).toEqual([true]);
      });
      expect(values).toEqual([true, false]);
      expect(get(isEven)).toEqual(false);
      unsubscribe();
    });

    it('should work when first subscribing to a store inside batch', () => {
      const a = writable(0);
      const values: number[] = [];
      let unsubscribe!: () => void;
      batch(() => {
        a.set(1);
        unsubscribe = a.subscribe((v) => values.push(v));
        expect(values).toEqual([1]);
      });
      expect(values).toEqual([1]);
      a.set(2);
      expect(values).toEqual([1, 2]);
      unsubscribe();
    });

    it('should work when doing a second subscription to a store inside batch', () => {
      const a = writable(0);
      const values1: number[] = [];
      const values2: number[] = [];
      const unsubscribe1 = a.subscribe((v) => values1.push(v));
      let unsubscribe2!: () => void;
      expect(values1).toEqual([0]);
      batch(() => {
        a.set(1);
        unsubscribe2 = a.subscribe((v) => values2.push(v));
        expect(values1).toEqual([0]);
        expect(values2).toEqual([1]);
      });
      expect(values1).toEqual([0, 1]);
      expect(values2).toEqual([1]);
      a.set(2);
      expect(values1).toEqual([0, 1, 2]);
      expect(values2).toEqual([1, 2]);
      unsubscribe1();
      unsubscribe2();
    });

    it('should work when first subscribing to a derived store inside batch', () => {
      const a = writable(0);
      const b = derived(a, (a) => a + 1);
      const values: number[] = [];
      let unsubscribe!: () => void;
      batch(() => {
        a.set(1);
        unsubscribe = b.subscribe((v) => values.push(v));
        expect(values).toEqual([2]);
      });
      expect(values).toEqual([2]);
      a.set(2);
      expect(values).toEqual([2, 3]);
      unsubscribe();
    });

    it('should work when doing a second subscription to a derived store inside batch', () => {
      const a = writable(0);
      const b = derived(a, (a) => a + 1);
      const values1: number[] = [];
      const values2: number[] = [];
      const unsubscribe1 = b.subscribe((v) => values1.push(v));
      expect(values1).toEqual([1]);
      let unsubscribe2!: () => void;
      batch(() => {
        a.set(1);
        unsubscribe2 = b.subscribe((v) => values2.push(v));
        expect(values1).toEqual([1]);
        expect(values2).toEqual([1]); // gets the previous value of store b to avoid extra computation before the end of batch
      });
      expect(values1).toEqual([1, 2]);
      expect(values2).toEqual([1, 2]);
      a.set(2);
      expect(values1).toEqual([1, 2, 3]);
      expect(values2).toEqual([1, 2, 3]);
      unsubscribe1();
      unsubscribe2();
    });

    it('should work when doing a first subscription to a derived store of an already subscribed store inside batch', () => {
      const a = writable(0);
      const b = derived(a, (a) => a + 1, -1);
      const values1: number[] = [];
      const values2: number[] = [];
      const unsubscribe1 = a.subscribe((v) => values1.push(v));
      let unsubscribe2!: () => void;
      expect(values1).toEqual([0]);
      batch(() => {
        a.set(1);
        unsubscribe2 = b.subscribe((v) => values2.push(v));
        expect(values1).toEqual([0]);
        expect(values2).toEqual([-1]); // gets the initial value of store b to avoid temporary computation
      });
      expect(values1).toEqual([0, 1]);
      expect(values2).toEqual([-1, 2]);
      a.set(2);
      expect(values1).toEqual([0, 1, 2]);
      expect(values2).toEqual([-1, 2, 3]);
      unsubscribe1();
      unsubscribe2();
    });

    it('should work when doing a first subscription to a derived store of two stores with an already subscribed one inside batch', () => {
      const a = writable(0);
      const b = writable(0);
      const c = derived([a, b], ([a, b]) => `a${a}b${b}`, 'init');
      const values1: number[] = [];
      const values2: string[] = [];
      const unsubscribe1 = a.subscribe((v) => values1.push(v));
      expect(values1).toEqual([0]);
      let unsubscribe2!: () => void;
      batch(() => {
        a.set(1);
        b.set(1);
        unsubscribe2 = c.subscribe((v) => values2.push(v));
        expect(values2).toEqual(['init']); // gets the initial value of store c to avoid a temporary computation
        a.set(2);
        b.set(2);
        expect(values1).toEqual([0]);
        expect(values2).toEqual(['init']);
      });
      expect(values1).toEqual([0, 2]);
      expect(values2).toEqual(['init', 'a2b2']);
      a.set(3);
      expect(values1).toEqual([0, 2, 3]);
      expect(values2).toEqual(['init', 'a2b2', 'a3b2']);
      unsubscribe1();
      unsubscribe2();
    });

    it('should work with a derived store of a derived store that is paused but finally does not change', () => {
      const a = writable(0);
      const b = writable(0);
      const cFn = jasmine.createSpy('cFn', (a) => `a${a}`).and.callThrough();
      const c = derived(a, cFn);
      const dFn = jasmine.createSpy('dFn', ([b, c]) => `b${b}c${c}`).and.callThrough();
      const d = derived([b, c], dFn);
      const values: string[] = [];
      const unsubscribe = d.subscribe((v) => values.push(v));
      expect(values).toEqual(['b0ca0']);
      expect(cFn).toHaveBeenCalledTimes(1);
      expect(dFn).toHaveBeenCalledTimes(1);
      batch(() => {
        a.set(1);
        a.set(0);
        b.set(1);
        expect(cFn).toHaveBeenCalledTimes(1);
        expect(dFn).toHaveBeenCalledTimes(1);
        expect(values).toEqual(['b0ca0']);
      });
      expect(cFn).toHaveBeenCalledTimes(1); // should not call again cFn as a went back to its initial value
      expect(dFn).toHaveBeenCalledTimes(2);
      expect(values).toEqual(['b0ca0', 'b1ca0']);
      a.set(2);
      expect(cFn).toHaveBeenCalledTimes(2);
      expect(dFn).toHaveBeenCalledTimes(3);
      expect(values).toEqual(['b0ca0', 'b1ca0', 'b1ca2']);
      unsubscribe();
    });

    it('should work with a derived store of a derived store that is paused and finally changes', () => {
      const a = writable(0);
      const b = writable(0);
      const cFn = jasmine.createSpy('cFn', (a) => `a${a}`).and.callThrough();
      const c = derived(a, cFn);
      const dFn = jasmine.createSpy('dFn', ([b, c]) => `b${b}c${c}`).and.callThrough();
      const d = derived([b, c], dFn);
      const values: string[] = [];
      const unsubscribe = d.subscribe((v) => values.push(v));
      expect(values).toEqual(['b0ca0']);
      expect(cFn).toHaveBeenCalledTimes(1);
      expect(dFn).toHaveBeenCalledTimes(1);
      batch(() => {
        a.set(1);
        a.set(0);
        b.set(1);
        a.set(1);
        expect(cFn).toHaveBeenCalledTimes(1);
        expect(dFn).toHaveBeenCalledTimes(1);
        expect(values).toEqual(['b0ca0']);
      });
      expect(cFn).toHaveBeenCalledTimes(2);
      expect(dFn).toHaveBeenCalledTimes(2);
      expect(values).toEqual(['b0ca0', 'b1ca1']);
      a.set(2);
      expect(cFn).toHaveBeenCalledTimes(3);
      expect(dFn).toHaveBeenCalledTimes(3);
      expect(values).toEqual(['b0ca0', 'b1ca1', 'b1ca2']);
      unsubscribe();
    });

    it('should work with a derived store of an async derived store that is paused but does not set any new value', () => {
      const a = writable(0);
      const b = writable(0);
      const cFn = jasmine
        .createSpy('cFn', (a, set) => {
          // set is only called if a is even, otherwise the old value is kept
          if (a % 2 === 0) set(`a${a}`);
        })
        .and.callThrough();
      const c = derived(a, cFn, 'i');
      const dFn = jasmine.createSpy('dFn', ([b, c]) => `b${b}c${c}`).and.callThrough();
      const d = derived([b, c], dFn);
      const values: string[] = [];
      const unsubscribe = d.subscribe((v) => values.push(v));
      expect(values).toEqual(['b0ca0']);
      expect(cFn).toHaveBeenCalledTimes(1);
      expect(dFn).toHaveBeenCalledTimes(1);
      batch(() => {
        a.set(1);
        a.set(0);
        a.set(1); // will be ignored by c
        expect(cFn).toHaveBeenCalledTimes(1);
        expect(dFn).toHaveBeenCalledTimes(1);
        expect(values).toEqual(['b0ca0']);
      });
      expect(cFn).toHaveBeenCalledTimes(2); // called again because a changed
      expect(dFn).toHaveBeenCalledTimes(1); // not called again because c did not change
      expect(values).toEqual(['b0ca0']);
      b.set(1);
      expect(cFn).toHaveBeenCalledTimes(2); // not called again because a did not change
      expect(dFn).toHaveBeenCalledTimes(2); // called again because b changed
      expect(values).toEqual(['b0ca0', 'b1ca0']);
      a.set(2);
      expect(cFn).toHaveBeenCalledTimes(3); // called again because a changed
      expect(dFn).toHaveBeenCalledTimes(3); // called again because c changed
      expect(values).toEqual(['b0ca0', 'b1ca0', 'b1ca2']);
      unsubscribe();
    });

    it('should not call an unregistered listener', () => {
      const store = writable(0);
      const calls: number[] = [];
      const fn = (n: number) => calls.push(n);
      const unsubscribe = store.subscribe(fn);
      expect(calls).toEqual([0]);
      batch(() => {
        store.set(1);
        store.set(2);
        expect(calls).toEqual([0]);
        unsubscribe();
        store.set(3);
      });
      expect(calls).toEqual([0]);
    });
  });
});