import { derived, DerivedStore, Store, SubscribableStore, writable, get, readable } from './index';
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
      const d = derived([b, c], ([b, c]) => `${b}${c}`);

      const values: string[] = [];

      const unsubscribe = d.subscribe((value) => {
        values.push(value);
      });
      expect(values).toEqual(['b0c0']);
      a.set(1);
      expect(values).toEqual(['b0c0', 'b1c1']);
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
});
