import { AsyncPipe } from '@angular/common';
import { Component, Injectable, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, from } from 'rxjs';
import { writable as svelteWritable } from 'svelte/store';
import { describe, expect, it, vi } from 'vitest';
import {
  DerivedStore,
  Readable,
  ReadableSignal,
  Store,
  StoreInput,
  StoreOptions,
  StoresInput,
  StoresInputValues,
  SubscribableStore,
  SubscriberObject,
  asWritable,
  asReadable,
  batch,
  computed,
  derived,
  get,
  readable,
  symbolObservable,
  untrack,
  writable,
} from './index';

const customSimpleWritable = <T>(
  value: T
): SubscribableStore<T> & { subscribers: Partial<SubscriberObject<T>>[]; set(value: T): void } => {
  const subscribers: Partial<SubscriberObject<T>>[] = [];
  return {
    subscribers,
    subscribe(listener) {
      const listenerObject = {
        next: typeof listener === 'function' ? listener.bind(null) : listener?.next?.bind(listener),
        pause: listener?.pause?.bind(listener),
        resume: listener?.resume?.bind(listener),
      };
      subscribers.push(listenerObject);
      listenerObject.next?.(value);
      return () => {
        const index = subscribers.indexOf(listenerObject);
        if (index > -1) {
          subscribers.splice(index, 1);
        }
      };
    },
    set(v: T) {
      value = v;
      subscribers.forEach((l) => {
        l.next?.(v);
      });
    },
  };
};

const switchMap = <S extends StoresInput, U>(
  store: S,
  fn: (value: StoresInputValues<S>) => StoreInput<U>,
  options?: Omit<StoreOptions<U>, 'onUse'>
): Readable<U> =>
  derived(
    derived(store, { equal: Object.is, derive: (value) => fn(value) }),
    { ...options, derive: (store, set) => asReadable(store).subscribe(set) },
    undefined as U
  );

describe('stores', () => {
  describe('base', () => {
    it('should accept initial value and expose it to subscribers', () => {
      class BasicStore extends Store<string> {}
      const store = new BasicStore('Hello, World');

      let defValue: undefined | string;
      store.subscribe((v) => (defValue = v));

      expect(defValue).toBe('Hello, World');
    });

    it('should allow overriding equal', () => {
      const equalCalls: [number, number][] = [];
      class ModuloStore extends Store<number> {
        constructor(
          public readonly modulo: number,
          initialValue: number
        ) {
          super(initialValue);
        }
        protected override equal(a: number, b: number): boolean {
          equalCalls.push([a, b]);
          return a % this.modulo === b % this.modulo;
        }
        override set(value: number) {
          super.set(value);
        }
      }
      const modulo10 = new ModuloStore(10, 1); // two numbers are considered equal if the last digit is the same
      const changes: number[] = [];
      modulo10.subscribe((value) => changes.push(value));
      modulo10.set(11); // no change
      expect(get(modulo10)).toEqual(1);
      modulo10.set(14);
      expect(get(modulo10)).toEqual(14);
      modulo10.set(4); // no change
      expect(get(modulo10)).toEqual(14);
      modulo10.set(11);
      expect(get(modulo10)).toEqual(11);
      modulo10.set(2);
      expect(get(modulo10)).toEqual(2);
      const changes2: number[] = [];
      const changes3: number[] = [];
      batch(() => {
        modulo10.set(3);
        expect(get(modulo10)).toEqual(3);
        modulo10.set(4);
        expect(get(modulo10)).toEqual(4);
        modulo10.subscribe((value) => changes2.push(value));
        modulo10.subscribe((value) => changes3.push(value));
        modulo10.set(5);
        expect(get(modulo10)).toEqual(5);
        modulo10.set(2);
      });
      expect(changes2).toEqual([4, 2]);
      expect(changes3).toEqual([4, 2]);
      expect(changes).toEqual([1, 14, 11, 2]);
      expect(equalCalls).toEqual([
        [1, 11],
        [1, 14],
        [14, 4],
        [14, 11],
        [11, 2],
        // inside batch:
        [2, 3],
        [3, 4],
        [4, 5],
        [5, 2],
        // leaving batch:
        [2, 2],
        [4, 2], // this is done once, even though 2 subscribers need it
      ]);
    });

    it('should allow overriding notEqual', () => {
      const notEqualCalls: [number, number][] = [];
      class ModuloStore extends Store<number> {
        constructor(
          public readonly modulo: number,
          initialValue: number
        ) {
          super(initialValue);
        }
        protected override notEqual(a: number, b: number): boolean {
          notEqualCalls.push([a, b]);
          return a % this.modulo !== b % this.modulo;
        }
        override set(value: number) {
          super.set(value);
        }
      }
      const modulo10 = new ModuloStore(10, 1); // two numbers are considered equal if the last digit is the same
      const changes: number[] = [];
      modulo10.subscribe((value) => changes.push(value));
      modulo10.set(11); // no change
      expect(get(modulo10)).toEqual(1);
      modulo10.set(14);
      expect(get(modulo10)).toEqual(14);
      modulo10.set(4); // no change
      expect(get(modulo10)).toEqual(14);
      modulo10.set(11);
      expect(get(modulo10)).toEqual(11);
      modulo10.set(2);
      expect(get(modulo10)).toEqual(2);
      const changes2: number[] = [];
      const changes3: number[] = [];
      batch(() => {
        modulo10.set(3);
        expect(get(modulo10)).toEqual(3);
        modulo10.set(4);
        expect(get(modulo10)).toEqual(4);
        modulo10.subscribe((value) => changes2.push(value));
        modulo10.subscribe((value) => changes3.push(value));
        modulo10.set(5);
        expect(get(modulo10)).toEqual(5);
        modulo10.set(2);
      });
      expect(changes2).toEqual([4, 2]);
      expect(changes3).toEqual([4, 2]);
      expect(changes).toEqual([1, 14, 11, 2]);
      expect(notEqualCalls).toEqual([
        [1, 11],
        [1, 14],
        [14, 4],
        [14, 11],
        [11, 2],
        // inside batch:
        [2, 3],
        [3, 4],
        [4, 5],
        [5, 2],
        // leaving batch:
        [2, 2],
        [4, 2], // this is done once, even though 2 subscribers need it
      ]);
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

        override onUse() {
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

        override onUse() {
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
        override onUse() {
          this.set('from onUse');
        }

        override update() {
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
        public override pauseSubscribers(): void {
          super.pauseSubscribers();
        }
        public override resumeSubscribers(): void {
          super.resumeSubscribers();
        }
        public override set(value: object): void {
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

    it('asReadable should be compatible with rxjs (BehaviorSubject)', () => {
      const behaviorSubject = new BehaviorSubject(0);
      const store = asReadable(behaviorSubject);
      expect(store.subscribe).toBeDefined();
      expect(store[symbolObservable]).toBeDefined();
      const values: number[] = [];
      const unsubscribe = store.subscribe((value) => values.push(value));
      expect(values).toEqual([0]);
      expect(typeof unsubscribe).toBe('function');
      expect(unsubscribe.unsubscribe).toBe(unsubscribe);
      behaviorSubject.next(1);
      expect(values).toEqual([0, 1]);
      unsubscribe();
      behaviorSubject.next(2);
      expect(values).toEqual([0, 1]);
    });

    it('get should be compatible with rxjs (BehaviorSubject)', () => {
      const store = new BehaviorSubject(0);
      expect(get(store)).toBe(0);
    });

    it('asReadable should be compatible with rxjs (InteropObservable)', () => {
      const behaviorSubject = new BehaviorSubject(0);
      const interop = { [symbolObservable]: () => behaviorSubject };
      const store = asReadable(interop);
      expect(store.subscribe).toBeDefined();
      expect(store[symbolObservable]).toBeDefined();
      const values: number[] = [];
      const unsubscribe = store.subscribe((value) => values.push(value));
      expect(values).toEqual([0]);
      expect(typeof unsubscribe).toBe('function');
      expect(unsubscribe.unsubscribe).toBe(unsubscribe);
      behaviorSubject.next(1);
      expect(values).toEqual([0, 1]);
      unsubscribe();
      behaviorSubject.next(2);
      expect(values).toEqual([0, 1]);
    });

    it('asReadable should not wrap its output subscribe function into a new wrapper when called again (BehaviorSubject)', () => {
      const input = new BehaviorSubject(0);
      const readable1 = asReadable(input);
      const readable2 = asReadable(readable1);
      expect(readable1.subscribe).toBe(readable2.subscribe);
    });

    it('asReadable should not wrap its output subscribe function into a new wrapper when called again (InteropObservable)', () => {
      const b = new BehaviorSubject(1);
      const input = { [symbolObservable]: () => b };
      const readable1 = asReadable(input);
      const readable2 = asReadable(readable1);
      expect(readable1.subscribe).toBe(readable2.subscribe);
    });

    it('asReadable should not wrap the readable (const store) subscribe function into a new wrapper', () => {
      const readable1 = readable(5);
      const readable2 = asReadable(readable1);
      expect(readable1.subscribe).toBe(readable2.subscribe);
    });

    it('asReadable should not wrap the readable (with onUse) subscribe function into a new wrapper', () => {
      const readable1 = readable(5, { onUse() {} });
      const readable2 = asReadable(readable1);
      expect(readable1.subscribe).toBe(readable2.subscribe);
    });

    it('asReadable should not wrap the writable subscribe function into a new wrapper', () => {
      const readable1 = writable(5);
      const readable2 = asReadable(readable1);
      expect(readable1.subscribe).toBe(readable2.subscribe);
    });

    it('asReadable should work nicely as a return value of a function whose type is explicitly defined', () => {
      interface Counter extends ReadableSignal<number> {
        increment(): void;
      }
      const createCounter = (): Counter => {
        const store = writable(0);
        return asReadable(store, {
          increment() {
            store.update((value) => value + 1);
          },
        });
      };
      const counter = createCounter();
      expect(counter()).toBe(0);
      counter.increment();
      expect(counter()).toBe(1);
    });

    it('get should be compatible with rxjs (InteropObservable)', () => {
      const b = new BehaviorSubject(1);
      const i = { [symbolObservable]: () => b };
      expect(get(i)).toBe(1);
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

    it('should be compatible with rxjs "from" (InteropObservable)', () => {
      const store = writable(0);
      const interop = { [symbolObservable]: () => store };
      const observable = from(interop);
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

    it('should work with AsyncPipe', () => {
      @Component({
        selector: `should-work-with-async-pipe-test`,
        template: `Value: {{ store | async }}`,
        standalone: true,
        imports: [AsyncPipe],
      })
      class MyComponent {
        store = writable(0);
      }
      const fixture = TestBed.createComponent(MyComponent);
      const componentInstance = fixture.componentInstance;
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('Value: 0');
      componentInstance.store.set(1);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('Value: 1');
      fixture.destroy();
    });

    it('should work to inject a class extending Store', () => {
      @Injectable()
      class MyStore extends Store<number> {
        hasListeners = false;
        constructor() {
          super(0);
        }
        increment() {
          this.update((value) => value + 1);
        }
        protected override onUse() {
          this.hasListeners = true;
          return () => {
            this.hasListeners = false;
          };
        }
      }

      @Component({
        selector: 'should-work-to-inject-a-class-extending-store-test',
        template: `Value: {{ store | async }}`,
        standalone: true,
        imports: [AsyncPipe],
        providers: [MyStore],
      })
      class MyComponent {
        store = inject(MyStore);
      }
      const fixture = TestBed.createComponent(MyComponent);
      const componentInstance = fixture.componentInstance;
      fixture.detectChanges();
      expect(componentInstance.store.hasListeners).toBe(true);
      expect(fixture.nativeElement.textContent).toBe('Value: 0');
      componentInstance.store.increment();
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('Value: 1');
      fixture.destroy();
      expect(componentInstance.store.hasListeners).toBe(false);
    });
  });

  describe('readable shorthand', () => {
    it('should expose readable store creation function', () => {
      const one = readable(1);
      expect(get(one)).toBe(1);
    });

    it('should work to call a constant store as a function', () => {
      const one = readable(1);
      expect(one()).toBe(1);
    });

    it('should work to subscribe without a listener', () => {
      let used = 0;
      const a = readable(0, () => {
        used++;
        return () => {
          used--;
        };
      });
      const unsubscribe = a.subscribe(null);
      expect(used).toBe(1);
      unsubscribe();
      expect(used).toBe(0);
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

    it('should accept an options object with onUse property', () => {
      const store = readable(-1, {
        onUse({ set, update }) {
          set(0);
          update((v) => v + 1);
        },
      });

      expect(get(store)).toBe(1);
    });

    it('should accept an options object with onUse and equal properties', () => {
      const equalCalls: [number, number][] = [];
      const store = readable(-1, {
        onUse({ set, update }) {
          expect(this).toBeFalsy();
          set(0);
          update((v) => v + 1);
        },
        equal(a, b) {
          expect(this).toBeFalsy();
          equalCalls.push([a, b]);
          return true;
        },
      });

      expect(get(store)).toBe(-1);
      expect(equalCalls).toEqual([
        [-1, 0],
        [-1, 0],
      ]);
    });

    it('should accept an options object with onUse and notEqual properties', () => {
      const notEqualCalls: [number, number][] = [];
      const store = readable(-1, {
        onUse({ set, update }) {
          expect(this).toBeFalsy();
          set(0);
          update((v) => v + 1);
        },
        notEqual(a, b) {
          expect(this).toBeFalsy();
          notEqualCalls.push([a, b]);
          return false;
        },
      });

      expect(get(store)).toBe(-1);
      expect(notEqualCalls).toEqual([
        [-1, 0],
        [-1, 0],
      ]);
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

    it('should work to call a writable as a function', () => {
      const counter = writable(0);
      expect(counter()).toBe(0);

      counter.update((c) => c + 1);
      expect(counter()).toBe(1);

      counter.set(0);
      expect(counter()).toBe(0);
    });

    it('should accept onUse hook function', () => {
      const store = writable(-1, ({ set, update }) => {
        set(0);
        update((v) => v + 1);
      });

      expect(get(store)).toBe(1);
    });

    it('should accept an options object with onUse hook function', () => {
      const store = writable(-1, {
        onUse({ set, update }) {
          set(0);
          update((v) => v + 1);
        },
      });

      expect(get(store)).toBe(1);
    });

    it('should accept an options object with onUse and equal properties', () => {
      const equalCalls: [number, number][] = [];
      const store = writable(-1, {
        onUse({ set, update }) {
          expect(this).toBeFalsy();
          set(0);
          update((v) => v + 1);
        },
        equal(a, b) {
          expect(this).toBeFalsy();
          equalCalls.push([a, b]);
          return true;
        },
      });

      expect(get(store)).toBe(-1);
      expect(equalCalls).toEqual([
        [-1, 0],
        [-1, 0],
      ]);
    });

    it('should accept an options object with onUse and notEqual properties', () => {
      const notEqualCalls: [number, number][] = [];
      const store = writable(-1, {
        onUse({ set, update }) {
          expect(this).toBeFalsy();
          set(0);
          update((v) => v + 1);
        },
        notEqual(a, b) {
          expect(this).toBeFalsy();
          notEqualCalls.push([a, b]);
          return false;
        },
      });

      expect(get(store)).toBe(-1);
      expect(notEqualCalls).toEqual([
        [-1, 0],
        [-1, 0],
      ]);
    });

    // https://github.com/sveltejs/svelte/blob/84ac3a53d53a84194cd9f121a27809a60764d6fc/test/store/index.js
    it('should not assume immutable data', () => {
      const obj = {};
      let called = 0;

      const store = writable(obj);

      store.subscribe(() => {
        called += 1;
      });

      expect(called).toBe(1);

      store.set(obj);
      expect(called).toBe(2);

      store.update((obj) => obj);
      expect(called).toBe(3);
    });

    it('should allow overriding equal for immutable data', () => {
      const obj = {};
      let called = 0;

      const store = writable(obj, { equal: Object.is });

      store.subscribe(() => {
        called += 1;
      });

      expect(called).toBe(1);

      store.set(obj);
      expect(called).toBe(1);

      store.update((obj) => obj);
      expect(called).toBe(1);

      store.set({ ...obj });
      expect(called).toBe(2);

      store.update((obj) => ({ ...obj }));
      expect(called).toBe(3);
    });

    it('should allow overriding notEqual for immutable data', () => {
      const obj = {};
      let called = 0;

      const store = writable(obj, { notEqual: (a, b) => !Object.is(a, b) });

      store.subscribe(() => {
        called += 1;
      });

      expect(called).toBe(1);

      store.set(obj);
      expect(called).toBe(1);

      store.update((obj) => obj);
      expect(called).toBe(1);

      store.set({ ...obj });
      expect(called).toBe(2);

      store.update((obj) => ({ ...obj }));
      expect(called).toBe(3);
    });

    it('should not emit when a primitive value does not change', () => {
      const values: any[] = [];
      const numStore = writable(5);
      const strStore = writable('foo');
      const boolStore = writable(true);
      const undefinedStore = writable(undefined);
      const nullStore = writable(null);

      numStore.subscribe((v) => values.push(v));
      strStore.subscribe((v) => values.push(v));
      boolStore.subscribe((v) => values.push(v));
      undefinedStore.subscribe((v) => values.push(v));
      nullStore.subscribe((v) => values.push(v));
      expect(values).toEqual([5, 'foo', true, undefined, null]);

      numStore.set(5);
      strStore.set('foo');
      boolStore.set(true);
      undefinedStore.set(undefined);
      nullStore.set(null);
      expect(values).toEqual([5, 'foo', true, undefined, null]);
    });

    it('should re-emit for an object even if it does not change', () => {
      const values: any[] = [];
      const ref = {};
      const objectStore = writable(ref);

      objectStore.subscribe((v) => values.push(v));
      expect(values).toEqual([ref]);

      objectStore.set(ref);
      expect(values).toEqual([ref, ref]);
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

    it('should work with asReadable to expose the store read-only', () => {
      const writableStore = writable(5);
      const readonlyStore = asReadable(writableStore);
      const values: number[] = [];
      const unsubscribe = readonlyStore.subscribe((value) => {
        values.push(value);
      });
      expect(values).toEqual([5]);
      writableStore.set(6);
      expect(values).toEqual([5, 6]);
      unsubscribe();
      writableStore.set(7);
      expect(values).toEqual([5, 6]);

      expect((readonlyStore as any).set).toBeUndefined();
      expect((readonlyStore as any).update).toBeUndefined();
      expect(readonlyStore[Symbol.observable || '@@observable']()).toBe(readonlyStore);
    });
  });

  describe('asWritable', () => {
    class MyStore extends Store<number> {
      constructor() {
        super(0);
      }
      increment() {
        this.update((value) => value + 1);
      }
      reset(value: number) {
        this.set(value);
      }
    }

    it('should work with a computed with a set function', () => {
      const store = writable(0);
      const computedDoubleStore = computed(() => store() * 2);
      const writableDoubleStore = asWritable(computedDoubleStore, (value) => store.set(value / 2));
      expect(writableDoubleStore()).toBe(0);
      store.set(1);
      expect(writableDoubleStore()).toBe(2);
      writableDoubleStore.set(4);
      expect(store()).toBe(2);
      expect(writableDoubleStore()).toBe(4);
      writableDoubleStore.update((value) => value + 2);
      expect(writableDoubleStore()).toBe(6);
      expect(store()).toBe(3);
    });

    it('should work with an instance of a class extending Store with no set function', () => {
      const myStore = new MyStore();
      const writableStore = asWritable(myStore);
      expect(get(writableStore)).toBe(0);
      expect(writableStore()).toBe(0);
      myStore.increment();
      expect(get(writableStore)).toBe(1);
      expect(writableStore()).toBe(1);
      expect((writableStore as any).increment).toBeUndefined();
      // trying to change writableStore does nothing because no set function was provided:
      writableStore.set(2);
      expect(writableStore()).toBe(1);
      const updateFunction = vi.fn((value: number) => value * 2);
      writableStore.update(updateFunction);
      expect(updateFunction).not.toHaveBeenCalled();
      expect(writableStore()).toBe(1);
    });

    it('should work with an instance of a class extending Store with a set function', () => {
      const myStore = new MyStore();
      const writableStore = asWritable(myStore, (value) => myStore.reset(value));
      expect(get(writableStore)).toBe(0);
      expect(writableStore()).toBe(0);
      myStore.increment();
      expect(get(writableStore)).toBe(1);
      expect(writableStore()).toBe(1);
      expect((writableStore as any).increment).toBeUndefined();
      writableStore.set(2);
      expect(writableStore()).toBe(2);
      writableStore.update((value) => value * 2);
      expect(writableStore()).toBe(4);
    });

    it('should work with an instance of a class extending Store with multiple functions', () => {
      const myStore = new MyStore();
      const writableStore = asWritable(myStore, {
        set: (value) => myStore.reset(value),
        callIncrement: () => myStore.increment(),
      });
      expect(get(writableStore)).toBe(0);
      expect(writableStore()).toBe(0);
      myStore.increment();
      expect(get(writableStore)).toBe(1);
      expect(writableStore()).toBe(1);
      expect((writableStore as any).increment).toBeUndefined();
      writableStore.set(2);
      expect(writableStore()).toBe(2);
      writableStore.callIncrement();
      expect(writableStore()).toBe(3);
      writableStore.update((value) => value * 2);
      expect(writableStore()).toBe(6);
    });

    it('should work with an InteropObservable', () => {
      const behaviorSubject = new BehaviorSubject(0);
      const myStore = { [symbolObservable]: () => behaviorSubject, next: () => {} };
      const writableStore = asWritable(myStore, (value) => behaviorSubject.next(value));
      expect(get(writableStore)).toBe(0);
      expect(writableStore()).toBe(0);
      behaviorSubject.next(1);
      expect(get(writableStore)).toBe(1);
      expect(writableStore()).toBe(1);
      expect((writableStore as any).next).toBeUndefined();
      writableStore.set(2);
      expect(writableStore()).toBe(2);
      writableStore.update((value) => value * 2);
      expect(writableStore()).toBe(4);
    });

    it('should work with a writable', () => {
      const myStore = writable(0);
      const set = vi.fn(myStore.set);
      const update = vi.fn(myStore.update);
      const writableStore = asWritable(myStore, {
        set,
        update,
        increment: () => {
          myStore.update((value) => value + 1);
        },
      });
      expect(get(writableStore)).toBe(0);
      expect(writableStore()).toBe(0);
      myStore.set(1);
      expect(get(writableStore)).toBe(1);
      expect(writableStore()).toBe(1);
      expect(set).not.toHaveBeenCalled();
      writableStore.set(2);
      expect(set).toHaveBeenCalledOnce();
      set.mockClear();
      expect(writableStore()).toBe(2);
      expect(update).not.toHaveBeenCalled();
      writableStore.update((value) => value * 2);
      expect(update).toHaveBeenCalledOnce();
      update.mockClear();
      expect(writableStore()).toBe(4);
      writableStore.increment();
      expect(writableStore()).toBe(5);
      expect(set).not.toHaveBeenCalled();
      expect(update).not.toHaveBeenCalled();
    });

    it('should not track when getting the value of the store in update', () => {
      const counter = writable(0);
      const exposedCounter = asWritable(counter, counter.set);
      const num = writable(1);
      const doubleNum = computed(() => {
        exposedCounter.update((value) => value + 1);
        return num() * 2;
      });
      expect(counter()).toBe(0);
      expect(doubleNum()).toBe(2);
      expect(counter()).toBe(1);
      expect(doubleNum()).toBe(2);
      num.set(3);
      expect(counter()).toBe(1);
      expect(doubleNum()).toBe(6);
      expect(counter()).toBe(2);
      expect(doubleNum()).toBe(6);
      expect(counter()).toBe(2);
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

    it('should not call equal with undefined during the first computation', () => {
      const a = writable(1);
      const equal = vi.fn(Object.is);
      const b = derived([a], {
        derive([a]) {
          return a + 1;
        },
        equal,
      });
      const values: number[] = [];
      const unsubscribe = b.subscribe((value) => {
        values.push(value);
      });
      expect(equal).not.toHaveBeenCalled();
      a.set(2);
      expect(equal).toHaveBeenCalledOnce();
      expect(equal).toHaveBeenCalledWith(2, 3);
      unsubscribe();
    });

    it('should allow calling a derived store as a function', () => {
      const numbersStore = writable(0);
      const multiplyStore = derived([numbersStore], (values) => values[0] * 2);

      expect(multiplyStore()).toBe(0);

      numbersStore.set(5);
      expect(multiplyStore()).toBe(10);

      numbersStore.set(7);
      expect(multiplyStore()).toBe(14);
    });

    it('should support an option object from derived shorthand', () => {
      const numbersStore = writable(0);
      const multiplyStore = derived([numbersStore], { derive: (values) => values[0] * 2 });
      const values: number[] = [];
      multiplyStore.subscribe((value) => values.push(value));

      expect(get(multiplyStore)).toBe(0);

      numbersStore.set(5);
      expect(get(multiplyStore)).toBe(10);

      numbersStore.set(7);
      expect(get(multiplyStore)).toBe(14);

      expect(values).toEqual([0, 10, 14]);
    });

    it('should support an option object with equal from derived shorthand', () => {
      const numbersStore = writable(0);
      const multiplyStore = derived([numbersStore], {
        derive: (values) => values[0] * 2,
        equal: (a, b) => a % 10 === b % 10,
      });
      const values: number[] = [];
      multiplyStore.subscribe((value) => values.push(value));

      expect(get(multiplyStore)).toBe(0);

      numbersStore.set(5);
      expect(get(multiplyStore)).toBe(0);

      numbersStore.set(7);
      expect(get(multiplyStore)).toBe(14);

      expect(values).toEqual([0, 14]);
    });

    it('should support an option object with notEqual from derived shorthand', () => {
      const numbersStore = writable(0);
      const multiplyStore = derived([numbersStore], {
        derive: (values) => values[0] * 2,
        notEqual: (a, b) => a % 10 !== b % 10,
      });
      const values: number[] = [];
      multiplyStore.subscribe((value) => values.push(value));

      expect(get(multiplyStore)).toBe(0);

      numbersStore.set(5);
      expect(get(multiplyStore)).toBe(0);

      numbersStore.set(7);
      expect(get(multiplyStore)).toBe(14);

      expect(values).toEqual([0, 14]);
    });

    it('should not allow setting the onUse option from derived shorthand', () => {
      let onUseCalls = 0;
      const numbersStore = writable(0);
      const multiplyStore = derived([numbersStore], {
        derive: (values: number[]) => values[0] * 2,
        ...{
          onUse: () => {
            onUseCalls++;
          },
        },
        equal: (a: number, b: number) => a % 10 === b % 10,
      });
      const values: number[] = [];
      multiplyStore.subscribe((value) => values.push(value));

      expect(get(multiplyStore)).toBe(0);
      expect(values).toEqual([0]);
      expect(onUseCalls).toEqual(0);
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
      const deriveFn = vi.fn((a) => a * 2);
      const b = derived(a, deriveFn);
      expect(deriveFn).not.toHaveBeenCalled();
      const values: number[] = [];
      let unsubscribe = b.subscribe((b) => values.push(b));
      expect(deriveFn).toHaveBeenCalledTimes(1);
      expect(deriveFn).toHaveBeenCalledWith(2);
      deriveFn.mockClear();
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

    it('should be compatible with svelte', () => {
      const a = svelteWritable(0);
      const b = derived(a, (a) => a * 2);
      const values: number[] = [];
      const unsubscribe = b.subscribe((value) => values.push(value));
      expect(values).toEqual([0]);
      a.set(2);
      expect(values).toEqual([0, 4]);
      unsubscribe();
      a.set(3);
      expect(values).toEqual([0, 4]);
    });

    it('should be compatible with rxjs', () => {
      const a = new BehaviorSubject(0);
      const b = derived(a, (a) => a * 2);
      const values: number[] = [];
      const unsubscribe = b.subscribe((value) => values.push(value));
      expect(values).toEqual([0]);
      a.next(2);
      expect(values).toEqual([0, 4]);
      unsubscribe();
      a.next(3);
      expect(values).toEqual([0, 4]);
    });

    it('should be compatible with InteropObservable', () => {
      const a = new BehaviorSubject(0);
      const i = { [symbolObservable]: () => a };
      const b = derived(i, (i) => i * 2);
      const values: number[] = [];
      const unsubscribe = b.subscribe((value) => values.push(value));
      expect(values).toEqual([0]);
      a.next(2);
      expect(values).toEqual([0, 4]);
      unsubscribe();
      a.next(3);
      expect(values).toEqual([0, 4]);
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
      const dFn = vi.fn(([b, c]) => `${b}${c}`);
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
      const cFn = vi.fn(([a, b]) => `${a}${b}`);
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

    it('should throw when reaching the maximum number of derived iterations (on subscribe)', () => {
      const store = writable(0);
      const wrongDerivedStore = derived(store, (value) => {
        store.set(value - 1); // there is no boundary
        return value;
      });
      let reachedSubscriber = false;
      expect(() => {
        wrongDerivedStore.subscribe(() => {
          reachedSubscriber = true;
        });
      }).toThrowError('reached maximum number of store changes in one shot');
      expect(reachedSubscriber).toBe(false);
    });

    it('should throw when reaching the maximum number of derived iterations (on set)', () => {
      const store = writable(0);
      const wrongDerivedStore = derived(store, (value) => {
        if (value < 0) {
          store.set(value - 1); // there is no boundary
        }
        return value;
      });
      const values: number[] = [];
      const unsubscribe = wrongDerivedStore.subscribe((value) => {
        values.push(value);
      });
      expect(values).toEqual([0]);
      expect(() => {
        store.set(-1);
      }).toThrowError('reached maximum number of store changes in one shot');
      unsubscribe();
      expect(values).toEqual([0]);
    });

    it('should stop notifying following listeners if the value changed in a listener (finally no change)', () => {
      const store = writable(0);
      const values1: number[] = [];
      const unsubscribePositive = store.subscribe((value) => {
        values1.push(value);
        if (value < 0) {
          store.set(value + 1);
        }
      });
      expect(values1).toEqual([0]);
      const values2: number[] = [];
      const unsubscribe = store.subscribe((value) => values2.push(value));
      expect(values2).toEqual([0]);
      store.set(-2);
      expect(values1).toEqual([0, -2, -1, 0]);
      expect(values2).toEqual([0]);
      unsubscribePositive();
      unsubscribe();
    });

    it('should stop notifying following listeners if the value changed in a listener (finally with change)', () => {
      const store = writable(1);
      const values1: number[] = [];
      const unsubscribePositive = store.subscribe((value) => {
        values1.push(value);
        if (value < 0) {
          store.set(value + 1);
        }
      });
      expect(values1).toEqual([1]);
      const values2: number[] = [];
      const unsubscribe = store.subscribe((value) => values2.push(value));
      expect(values2).toEqual([1]);
      store.set(-2);
      expect(values1).toEqual([1, -2, -1, 0]);
      expect(values2).toEqual([1, 0]);
      unsubscribePositive();
      unsubscribe();
    });

    it('should stop notifying following listeners of a derived store if the value changed in a listener (finally no change)', () => {
      const store = writable(0);
      const identicalStore = derived(store, (value) => value);
      const values1: number[] = [];
      const unsubscribePositive = identicalStore.subscribe((value) => {
        values1.push(value);
        if (value < 0) {
          store.set(value + 1);
        }
      });
      expect(values1).toEqual([0]);
      const values2: number[] = [];
      const unsubscribe = identicalStore.subscribe((value) => values2.push(value));
      expect(values2).toEqual([0]);
      store.set(-2);
      expect(values1).toEqual([0, -2, -1, 0]);
      expect(values2).toEqual([0]);
      unsubscribePositive();
      unsubscribe();
    });

    it('should stop notifying following listeners of a derived store if the value changed in a listener (finally with change)', () => {
      const store = writable(1);
      const identicalStore = derived(store, (value) => value);
      const values1: number[] = [];
      const unsubscribePositive = identicalStore.subscribe((value) => {
        values1.push(value);
        if (value < 0) {
          store.set(value + 1);
        }
      });
      expect(values1).toEqual([1]);
      const values2: number[] = [];
      const unsubscribe = identicalStore.subscribe((value) => values2.push(value));
      expect(values2).toEqual([1]);
      store.set(-2);
      expect(values1).toEqual([1, -2, -1, 0]);
      expect(values2).toEqual([1, 0]);
      unsubscribePositive();
      unsubscribe();
    });

    it('should not have glitches when setting the value of a store inside derived', () => {
      const events: string[] = [];
      const currentlyVisible$ = writable(true);
      const visible$ = writable(true);
      const transitioning$ = writable(false);
      const hidden$ = derived(
        [visible$, transitioning$],
        ([visible, transitioning]) => !visible && !transitioning
      );
      const state$ = derived(
        [visible$, transitioning$, hidden$],
        ([visible, transitioning, hidden]) => {
          if (hidden !== (!visible && !transitioning)) {
            // inconsistent state!!
            events.push('!!! ERROR: Inconsistent state detected !!!');
          }
          return `visible=${visible},transitioning=${transitioning},hidden=${hidden}`;
        }
      );
      const visibleChange = derived(
        [currentlyVisible$, visible$],
        ([currentlyVisible, visible]) => {
          if (currentlyVisible !== visible) {
            batch(() => {
              transitioning$.set(true);
              currentlyVisible$.set(visible);
            });
          }
        }
      );
      const unsubscribeState = state$.subscribe((state) => {
        events.push(`state:${state}`);
      });
      const unsubscribeVisibleChange = visibleChange.subscribe(() => {});
      events.push('1:set visible=false');
      visible$.set(false);
      events.push('2:set transitioning=false');
      transitioning$.set(false);
      events.push('3:set visible=true');
      visible$.set(true);
      events.push('4:set transitioning=false');
      transitioning$.set(false);
      events.push('5:finished');
      unsubscribeVisibleChange();
      unsubscribeState();
      expect(events).toEqual([
        'state:visible=true,transitioning=false,hidden=false',
        '1:set visible=false',
        'state:visible=false,transitioning=true,hidden=false',
        '2:set transitioning=false',
        'state:visible=false,transitioning=false,hidden=true',
        '3:set visible=true',
        'state:visible=true,transitioning=true,hidden=false',
        '4:set transitioning=false',
        'state:visible=true,transitioning=false,hidden=false',
        '5:finished',
      ]);
    });

    it('should give the final value synchronously on subscribe outside batch when changing the value inside derived', () => {
      const store = writable(0);
      const fn = vi.fn((value: number) => {
        if (value < 10) {
          store.set(value + 1);
        }
        return value;
      });
      const derivedStore = derived(store, fn);
      const values: number[] = [];
      const unsubscribe = derivedStore.subscribe((value) => {
        values.push(value);
      });
      expect(fn).toHaveBeenCalledTimes(11);
      unsubscribe();
      expect(values).toEqual([10]);
    });

    it('should give the final value synchronously on subscribe in batch when changing the value inside derived', () => {
      const store = writable(0);
      const fn = vi.fn((value: number) => {
        if (value < 10) {
          store.set(value + 1);
        }
        return value;
      });
      const derivedStore = derived(store, fn);
      const values: number[] = [];
      batch(() => {
        const unsubscribe = derivedStore.subscribe((value) => {
          values.push(value);
        });
        expect(fn).toHaveBeenCalledTimes(11);
        expect(values).toEqual([10]);
        unsubscribe();
      });
    });

    it('should not notify listeners if the final value did not change when changing the value inside derived', () => {
      const store = writable(10);
      const fn = vi.fn((value: number) => {
        if (value < 10) {
          store.set(value + 1);
        }
        return value;
      });
      const derivedStore = derived(store, fn);
      const values: number[] = [];
      const unsubscribe = derivedStore.subscribe((value) => {
        values.push(value);
      });
      expect(fn).toHaveBeenCalledTimes(1);
      expect(values).toEqual([10]);
      store.set(0);
      expect(fn).toHaveBeenCalledTimes(12);
      expect(values).toEqual([10]);
      unsubscribe();
    });

    it('should notify listeners if the final value changed when changing the value inside derived', () => {
      const store = writable(11);
      const fn = vi.fn((value: number) => {
        if (value < 10) {
          store.set(value + 1);
        }
        return value;
      });
      const derivedStore = derived(store, fn);
      const values: number[] = [];
      const unsubscribe = derivedStore.subscribe((value) => {
        values.push(value);
      });
      expect(fn).toHaveBeenCalledTimes(1);
      expect(values).toEqual([11]);
      store.set(0);
      expect(fn).toHaveBeenCalledTimes(12);
      expect(values).toEqual([11, 10]);
      unsubscribe();
    });

    it('should call derived functions only with the final value when changing the value inside a dependent derived', () => {
      const dirtyValue$ = writable(0);
      const minValue$ = writable(0);
      const valueDeriveFn = vi.fn(([dirtyValue, minValue]: [number, number]) => {
        if (dirtyValue < minValue) {
          dirtyValue$.set(dirtyValue + 1);
        }
        return dirtyValue;
      });
      const value$ = derived([dirtyValue$, minValue$], valueDeriveFn);
      const doubleDeriveFn = vi.fn((value: number) => value * 2);
      const double$ = derived(value$, doubleDeriveFn);

      const values: number[] = [];
      const unsubscribeValue = value$.subscribe((value) => {
        values.push(value);
      });

      const doubles: number[] = [];
      const unsubscribeDouble = double$.subscribe((value) => {
        doubles.push(value);
      });

      expect(valueDeriveFn).toHaveBeenCalledTimes(1);
      expect(doubleDeriveFn).toHaveBeenCalledTimes(1);
      expect(values).toEqual([0]);
      expect(doubles).toEqual([0]);

      minValue$.set(10);
      expect(valueDeriveFn).toHaveBeenCalledTimes(12);
      expect(doubleDeriveFn).toHaveBeenCalledTimes(2);
      expect(values).toEqual([0, 10]);
      expect(doubles).toEqual([0, 20]);

      unsubscribeValue();
      unsubscribeDouble();
    });

    it('should call derived functions only with the final value when changing the value inside a previous independent derived', () => {
      const dirtyValue$ = writable(0);
      const minValue$ = writable(0);
      const valueDeriveFn = vi.fn(([dirtyValue, minValue]: [number, number]) => {
        if (dirtyValue < minValue) {
          dirtyValue$.set(dirtyValue + 1);
        }
        return dirtyValue;
      });
      const value$ = derived([dirtyValue$, minValue$], valueDeriveFn);
      const doubleDeriveFn = vi.fn((value: number) => value * 2);
      const double$ = derived(dirtyValue$, doubleDeriveFn); // depends on dirtyValue$, not on value$

      const values: number[] = [];
      const unsubscribeValue = value$.subscribe((value) => {
        values.push(value);
      });

      const doubles: number[] = [];
      const unsubscribeDouble = double$.subscribe((value) => {
        doubles.push(value);
      });

      expect(valueDeriveFn).toHaveBeenCalledTimes(1);
      expect(doubleDeriveFn).toHaveBeenCalledTimes(1);
      expect(values).toEqual([0]);
      expect(doubles).toEqual([0]);

      minValue$.set(10);
      expect(valueDeriveFn).toHaveBeenCalledTimes(12);
      expect(doubleDeriveFn).toHaveBeenCalledTimes(2);
      expect(values).toEqual([0, 10]);
      expect(doubles).toEqual([0, 20]);

      unsubscribeValue();
      unsubscribeDouble();
    });

    it('should not loop endlessly when using a misbehaving store that calls pause', () => {
      const misbehavingStore = customSimpleWritable(0);
      const values: number[] = [];
      const derivedStore = derived(misbehavingStore, (value) => value);
      const unsubscribe = derivedStore.subscribe((value) => values.push(value));
      expect(values).toEqual([0]);
      misbehavingStore.set(1);
      expect(values).toEqual([0, 1]);
      expect(misbehavingStore.subscribers).toHaveLength(1);
      misbehavingStore.subscribers[0].pause?.();
      expect(get(derivedStore)).toBe(1);
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
        constructor(
          store: SubscribableStore<T>,
          initialValue: T,
          private _delay: number
        ) {
          super(store, initialValue);
        }
        protected derive(value: T) {
          const timeout = setTimeout(() => this.set(value), this._delay);
          return () => clearTimeout(timeout);
        }
      }
      vi.useFakeTimers();
      const a = writable(1);
      const b = new DebounceStore(a, 0, 100);
      const values: number[] = [];
      const unsubscribe = b.subscribe((value) => values.push(value));
      expect(values).toEqual([0]);
      vi.advanceTimersByTime(99);
      expect(values).toEqual([0]);
      vi.advanceTimersByTime(1);
      expect(values).toEqual([0, 1]);
      a.set(2);
      vi.advanceTimersByTime(1);
      a.set(3);
      vi.advanceTimersByTime(99);
      expect(values).toEqual([0, 1]);
      vi.advanceTimersByTime(1);
      expect(values).toEqual([0, 1, 3]);
      unsubscribe();
    });

    it('should infer types automatically in the async case', () => {
      const a = writable(1);
      const b = writable(2);
      const sum = derived(
        [a, b],
        ([a, b], set) => {
          set(a + b);
        },
        0
      );
      expect(get(sum)).toBe(3);
    });

    it('should infer types automatically in the sync case', () => {
      const a = writable(1);
      const b = writable(2);
      const sum = derived([a, b], ([a, b]) => a + b);
      expect(get(sum)).toBe(3);
    });

    it('should work to call update in the async case', () => {
      const a = writable(0);
      const history = derived(
        a,
        (a, set) => {
          set.update((values) => {
            if (values[values.length - 1] !== a) {
              return [...values, a];
            }
            return values;
          });
        },
        [] as number[]
      );
      const historyValues: number[][] = [];
      const unsubscribe = history.subscribe((value) => historyValues.push(value));
      expect(historyValues).toEqual([[0]]);
      a.set(1);
      expect(historyValues).toEqual([[0], [0, 1]]);
      unsubscribe();
      expect(get(history)).toEqual([0, 1]);
      a.set(10);
      expect(get(history)).toEqual([0, 1, 10]);
    });

    it('should call clean-up function returned in deriveFn with derived', () => {
      const a = writable(1);
      const cleanUpFn = vi.fn();
      const deriveFn = vi.fn((value: number, set: (a: number) => void) => {
        set(value * 2);
        return () => cleanUpFn(value);
      });
      const b = derived(a, deriveFn, 0);
      const values: number[] = [];
      expect(deriveFn).not.toHaveBeenCalled();
      const unsubscribe = b.subscribe((value) => values.push(value));
      expect(values).toEqual([2]);
      expect(deriveFn).toHaveBeenCalledTimes(1);
      deriveFn.mockClear();
      expect(cleanUpFn).not.toHaveBeenCalled();
      a.set(3);
      expect(values).toEqual([2, 6]);
      expect(deriveFn).toHaveBeenCalledTimes(1);
      deriveFn.mockClear();
      expect(cleanUpFn).toHaveBeenCalledWith(1);
      expect(cleanUpFn).toHaveBeenCalledTimes(1);
      cleanUpFn.mockClear();
      unsubscribe();
      expect(deriveFn).not.toHaveBeenCalled();
      expect(cleanUpFn).toHaveBeenCalledTimes(1);
      expect(cleanUpFn).toHaveBeenCalledWith(3);
    });

    it('should work with a derived function that calls set on a store it depends on without any impact on its own input value', () => {
      const defaultValue = writable(0);
      const ownValue = writable(undefined as number | undefined);
      const dirtyValue = derived([ownValue, defaultValue], ([ownValue, defaultValue]) =>
        ownValue === undefined ? defaultValue : ownValue
      );
      let derivedCalls = 0;
      let doSet = true;
      const finalValue = derived(dirtyValue, (value) => {
        derivedCalls++;
        if (doSet) {
          ownValue.set(value);
        }
        return value;
      });
      const calls: number[] = [];
      const unsubscribe = finalValue.subscribe((n: number) => calls.push(n));
      expect(derivedCalls).toBe(1);
      expect(calls).toEqual([0]);
      expect(get(ownValue)).toBe(0);
      doSet = false;
      ownValue.set(undefined);
      expect(derivedCalls).toBe(1);
      expect(calls).toEqual([0]);
      doSet = true;
      defaultValue.set(1);
      expect(derivedCalls).toBe(2);
      expect(calls).toEqual([0, 1]);
      expect(get(ownValue)).toBe(1);
      unsubscribe();
    });

    it('should work with a derived function that subscribes to itself', () => {
      const store = writable(0);
      let derivedCalls = 0;
      let innerUnsubscribe: undefined | (() => void);
      const innerSubscriptionCalls: any[] = [];
      const derivedStore = derived(store, (value) => {
        derivedCalls++;
        if (!innerUnsubscribe) {
          // the first call of the listener should contain undefined as the value is not yet computed
          innerUnsubscribe = derivedStore.subscribe((value) => innerSubscriptionCalls.push(value));
        }
        return value;
      });
      const calls: number[] = [];
      const unsubscribe = derivedStore.subscribe((n: number) => calls.push(n));
      expect(derivedCalls).toBe(1);
      expect(innerSubscriptionCalls).toEqual([undefined, 0]);
      expect(calls).toEqual([0]);
      unsubscribe();
      innerUnsubscribe!();
    });

    it('should work with a basic switchMap', () => {
      const a = writable(0);
      const b = writable(1);
      const c = writable(a);
      const d = switchMap(c, (value) => value);
      const values: number[] = [];
      const unsubscribe = d.subscribe((value) => values.push(value));
      expect(values).toEqual([0]);
      c.set(b);
      expect(values).toEqual([0, 1]);
      b.set(2);
      expect(values).toEqual([0, 1, 2]);
      a.set(3);
      expect(values).toEqual([0, 1, 2]);
      c.set(a);
      expect(values).toEqual([0, 1, 2, 3]);
      unsubscribe();
      a.set(4);
      expect(values).toEqual([0, 1, 2, 3]);
    });

    it('should not unsubscribe and subscribe again in switchMap if the store did not change', () => {
      const a = writable(1);
      const b = writable(2);
      const c = writable(0);
      const spy = vi.spyOn(a, 'subscribe');
      const d = switchMap(c, (c) => (c % 2 === 0 ? a : b));
      const values: number[] = [];
      const unsubscribe = d.subscribe((value) => values.push(value));
      expect(spy).toHaveBeenCalledTimes(1);
      spy.mockClear();
      expect(values).toEqual([1]);
      c.set(2);
      expect(values).toEqual([1]);
      expect(spy).not.toHaveBeenCalled();
      unsubscribe();
    });

    it('should work with switchMap with multiple stores as inputs', () => {
      const a = writable(0);
      const b = writable(1);
      const c = writable<SubscribableStore<number> | null>(null);
      const d = writable(a);
      const e = switchMap([c, d], ([c, d]) => c ?? d);
      const values: number[] = [];
      const unsubscribe = e.subscribe((value) => values.push(value));
      expect(values).toEqual([0]);
      c.set(b);
      expect(values).toEqual([0, 1]);
      b.set(2);
      expect(values).toEqual([0, 1, 2]);
      a.set(3);
      expect(values).toEqual([0, 1, 2]);
      c.set(null);
      expect(values).toEqual([0, 1, 2, 3]);
      d.set(b);
      expect(values).toEqual([0, 1, 2, 3, 2]);
      b.set(4);
      expect(values).toEqual([0, 1, 2, 3, 2, 4]);
      unsubscribe();
      b.set(5);
      expect(values).toEqual([0, 1, 2, 3, 2, 4]);
    });

    it('should work with switchMap and multiple levels of derived', () => {
      const defConfig = { a: 1 };
      const config = writable<Partial<typeof defConfig>>({});
      const configA = derived(config, (config) => config?.a);
      const aDef = derived(configA, (configA) => (configA === undefined ? defConfig.a : configA));
      const aOwn = writable(undefined as number | undefined);
      const aFinal = switchMap(aOwn, (value) => (value !== undefined ? readable(value) : aDef));
      const a: number[] = [];
      const unsubscribe = aFinal.subscribe((value) => a.push(value));
      expect(a).toEqual([1]);
      config.set({ a: 2 });
      expect(a).toEqual([1, 2]);
      config.set({});
      expect(a).toEqual([1, 2, 1]);
      aOwn.set(5);
      expect(a).toEqual([1, 2, 1, 5]);
      config.set({ a: 6 });
      expect(a).toEqual([1, 2, 1, 5]);
      aOwn.set(undefined);
      expect(a).toEqual([1, 2, 1, 5, 6]);
      unsubscribe();
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
        expect(get(b)).toEqual(2);
        a.set(0);
        expect(get(b)).toEqual(1);
      });
      expect(values).toEqual([1]);
      expect(get(b)).toEqual(1);
      batch(() => {
        a.set(1);
        expect(get(b)).toEqual(2);
        a.set(0);
        expect(get(b)).toEqual(1);
        a.set(1);
        expect(get(b)).toEqual(2);
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
        a.set(1); // isEven = false
        expect(get(isEven)).toEqual(false);
        a.set(2); // isEven = true again
        expect(get(isEven)).toEqual(true);
      });
      expect(values).toEqual([true]);
      expect(get(isEven)).toEqual(true);
      batch(() => {
        a.set(3); // isEven = false
        expect(get(isEven)).toEqual(false);
        a.set(4); // isEven = true
        expect(get(isEven)).toEqual(true);
        a.set(5); // isEven = false
        expect(get(isEven)).toEqual(false);
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
      const b = derived(a, (a) => a + 1, -1);
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
        expect(values2).toEqual([2]);
      });
      expect(values1).toEqual([1, 2]);
      expect(values2).toEqual([2]);
      a.set(2);
      expect(values1).toEqual([1, 2, 3]);
      expect(values2).toEqual([2, 3]);
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
        expect(values2).toEqual([2]);
      });
      expect(values1).toEqual([0, 1]);
      expect(values2).toEqual([2]);
      a.set(2);
      expect(values1).toEqual([0, 1, 2]);
      expect(values2).toEqual([2, 3]);
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
        expect(values2).toEqual(['a1b1']);
        a.set(2);
        b.set(2);
        expect(values1).toEqual([0]);
        expect(values2).toEqual(['a1b1']);
      });
      expect(values1).toEqual([0, 2]);
      expect(values2).toEqual(['a1b1', 'a2b2']);
      a.set(3);
      expect(values1).toEqual([0, 2, 3]);
      expect(values2).toEqual(['a1b1', 'a2b2', 'a3b2']);
      unsubscribe1();
      unsubscribe2();
    });

    it('should work with a derived store of a derived store that is paused but finally does not change', () => {
      const a = writable(0);
      const b = writable(0);
      const cFn = vi.fn((a) => `a${a}`);
      const c = derived(a, cFn);
      const dFn = vi.fn(([b, c]) => `b${b}c${c}`);
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
      const cFn = vi.fn((a) => `a${a}`);
      const c = derived(a, cFn);
      const dFn = vi.fn(([b, c]) => `b${b}c${c}`);
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
      const cFn = vi.fn((a, set) => {
        // set is only called if a is even, otherwise the old value is kept
        if (a % 2 === 0) set(`a${a}`);
      });
      const c = derived(a, cFn, 'i');
      const dFn = vi.fn(([b, c]) => `b${b}c${c}`);
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

    it('should be compatible with rxjs BehaviorSubject', () => {
      const a = new BehaviorSubject(0);
      const b = derived(a, (a: number) => a * 2);
      const values: number[] = [];
      const unsubscribe = b.subscribe((value) => values.push(value));
      expect(values).toEqual([0]);
      batch(() => {
        a.next(1);
        // note that because a is a non-tansu store, a.next(1)
        // will immediately call the derived store which will immediately
        // recompute its value (even inside a batch)
        // however, b is a tansu store so it will not notify its listeners
        // until the end of the batch
        expect(values).toEqual([0]);
        expect(get(b)).toEqual(2);
        a.next(2);
        a.next(3);
      });
      expect(values).toEqual([0, 6]);
      unsubscribe();
      a.next(4);
      expect(values).toEqual([0, 6]);
    });
  });

  describe('Listeners and batch timing', () => {
    function getObservedDerived<T>(stores: any, fn: (value: any) => any, initialValue: T) {
      const obj = {
        calls: 0,
        values: <T[]>[],
        store: <any>undefined,
        unsubscribe: () => {},
      };

      obj.store = derived(
        stores,
        (args) => {
          obj.calls++;
          return fn(args);
        },
        initialValue
      );

      obj.unsubscribe = obj.store.subscribe((value: any) => {
        return obj.values.push(value);
      });
      return obj;
    }

    it(`don't call unnecessary listener`, () => {
      const a = writable(0);
      const b = getObservedDerived(a, (value) => value, 1);
      expect(b.values).toEqual([0]);
      expect(b.calls).toEqual(1);

      batch(() => {
        a.set(1);
        expect(b.values).toEqual([0]);
        expect(b.calls).toEqual(1);
      });

      expect(b.values).toEqual([0, 1]);
      expect(b.calls).toBe(2);

      b.unsubscribe();
    });

    it(`don't call unnecessary related listeners`, () => {
      const a = writable(0);
      const b = getObservedDerived(a, (value) => value, 1);
      expect(b.values).toEqual([0]);
      expect(b.calls).toEqual(1);

      const c = getObservedDerived(a, (value) => value, 1);
      expect(c.values).toEqual([0]);
      expect(c.calls).toEqual(1);

      batch(() => {
        a.set(1);

        get(b.store);

        expect(c.values).toEqual([0]);
        expect(c.calls).toEqual(1);
      });

      expect(b.values).toEqual([0, 1]);
      expect(b.calls).toBe(2);

      expect(c.values).toEqual([0, 1]);
      expect(c.calls).toEqual(2);

      b.unsubscribe();
      c.unsubscribe();
    });

    it(`called in batch if necessary`, () => {
      const a = writable(0);
      const b = getObservedDerived(a, (value) => value, 0);
      expect(b.values).toEqual([0]);
      expect(b.calls).toEqual(1);

      batch(() => {
        a.set(1);
        expect(get(b.store)).toEqual(1);
        expect(b.calls).toEqual(2);
        expect(b.values).toEqual([0]);
      });

      expect(b.values).toEqual([0, 1]);
      expect(b.calls).toBe(2);

      b.unsubscribe();
    });

    it(`back and forth of original value`, () => {
      const a = writable(0);
      const b = getObservedDerived(a, (value) => value, 0);
      expect(b.values).toEqual([0]);
      expect(b.calls).toEqual(1);

      batch(() => {
        a.set(1);
        expect(get(b.store)).toEqual(1);
        expect(b.values).toEqual([0]);
        expect(b.calls).toEqual(2);

        a.set(0);
      });

      expect(b.values).toEqual([0]);
      expect(b.calls).toEqual(3);

      b.unsubscribe();
    });

    it(`skip intermediate values`, () => {
      const a = writable(0);
      const b = getObservedDerived(a, (value) => value, 0);
      expect(b.values).toEqual([0]);
      expect(b.calls).toEqual(1);

      batch(() => {
        a.set(1);
        expect(get(b.store)).toEqual(1);
        expect(b.values).toEqual([0]);
        expect(b.calls).toEqual(2);

        a.set(2);
        expect(get(b.store)).toEqual(2);
        expect(b.values).toEqual([0]);
        expect(b.calls).toEqual(3);
      });

      expect(b.values).toEqual([0, 2]);
      expect(b.calls).toEqual(3);

      b.unsubscribe();
    });

    it(`derived store dependency`, () => {
      const a = writable(0);

      const b = getObservedDerived(a, (value) => value, 0);
      expect(b.values).toEqual([0]);
      expect(b.calls).toEqual(1);

      const c = getObservedDerived([a, b.store], ([valueA, valueB]) => valueA + valueB, 0);
      expect(c.values).toEqual([0]);
      expect(c.calls).toEqual(1);

      batch(() => {
        a.set(1);
        expect(b.values).toEqual([0]);
        expect(b.calls).toEqual(1);

        expect(c.values).toEqual([0]);
        expect(c.calls).toEqual(1);

        expect(get(c.store)).toEqual(2);

        expect(b.values).toEqual([0]);
        expect(b.calls).toEqual(2);

        expect(c.values).toEqual([0]);
        expect(c.calls).toEqual(2);
      });

      expect(b.values).toEqual([0, 1]);
      expect(b.calls).toBe(2);

      expect(c.values).toEqual([0, 2]);
      expect(c.calls).toBe(2);

      b.unsubscribe();
      c.unsubscribe();
    });
  });

  describe('computed', () => {
    it('should not call equal with undefined during the first computation', () => {
      const a = writable(1);
      const equal = vi.fn(Object.is);
      const b = computed(() => a() + 1, {
        equal,
      });
      const values: number[] = [];
      const unsubscribe = b.subscribe((value) => {
        values.push(value);
      });
      expect(equal).not.toHaveBeenCalled();
      a.set(2);
      expect(equal).toHaveBeenCalledOnce();
      expect(equal).toHaveBeenCalledWith(2, 3);
      unsubscribe();
    });

    it('should properly subscribe to used stores and unsubscribe from unused ones', () => {
      const a = writable(true);
      let bHasListeners = false;
      const b = writable(0, () => {
        bHasListeners = true;
        return () => {
          bHasListeners = false;
        };
      });
      let cHasListeners = false;
      const c = writable(1, () => {
        cHasListeners = true;
        return () => {
          cHasListeners = false;
        };
      });
      const computedFn = vi.fn(() => (a() ? b() : c()));
      const d = computed(computedFn);

      expect(computedFn).not.toHaveBeenCalled();
      expect(bHasListeners).toBe(false);
      expect(cHasListeners).toBe(false);
      const values: number[] = [];
      const unsubscribe = d.subscribe((value) => values.push(value));
      expect(values).toEqual([0]);
      expect(computedFn).toHaveBeenCalledTimes(1);
      expect(bHasListeners).toBe(true);
      expect(cHasListeners).toBe(false);
      b.set(5);
      expect(values).toEqual([0, 5]);
      expect(computedFn).toHaveBeenCalledTimes(2);
      expect(bHasListeners).toBe(true);
      expect(cHasListeners).toBe(false);
      c.set(10); // not used, no change
      expect(values).toEqual([0, 5]);
      expect(computedFn).toHaveBeenCalledTimes(2);
      expect(bHasListeners).toBe(true);
      expect(cHasListeners).toBe(false);
      a.set(false);
      expect(values).toEqual([0, 5, 10]);
      expect(computedFn).toHaveBeenCalledTimes(3);
      expect(bHasListeners).toBe(false);
      expect(cHasListeners).toBe(true);
      b.set(3); // not used, no change
      expect(values).toEqual([0, 5, 10]);
      expect(computedFn).toHaveBeenCalledTimes(3);
      expect(bHasListeners).toBe(false);
      expect(cHasListeners).toBe(true);
      unsubscribe();
      expect(bHasListeners).toBe(false);
      expect(cHasListeners).toBe(false);
    });

    it('should not recompute if an untracked store changed', () => {
      const a = writable(1);
      const b = writable(2);
      const multiply = vi.fn(() => a() * untrack(() => b()));
      const c = computed(multiply);
      expect(multiply).not.toHaveBeenCalled();
      expect(c()).toEqual(2);
      expect(multiply).toHaveBeenCalledTimes(1);
      b.set(3);
      expect(c()).toEqual(2); // should not have been recomputed, as b is untracked
      expect(multiply).toHaveBeenCalledTimes(1);
      a.set(2);
      expect(multiply).toHaveBeenCalledTimes(1); // not yet requested, should not have computed yet
      expect(c()).toEqual(6); // now that it is recomputed, use the new b value
      expect(multiply).toHaveBeenCalledTimes(2);
    });

    it('should allow retrieving the value with get', () => {
      const a = writable(1);
      const b = writable(2);
      const multiply = vi.fn(() => get(a) * untrack(() => get(b)));
      const c = computed(multiply);
      expect(multiply).not.toHaveBeenCalled();
      expect(get(c)).toEqual(2);
      expect(multiply).toHaveBeenCalledTimes(1);
      b.set(3);
      expect(get(c)).toEqual(2); // should not have been recomputed, as b is untracked
      expect(multiply).toHaveBeenCalledTimes(1);
      a.set(2);
      expect(multiply).toHaveBeenCalledTimes(1); // not yet requested, should not have computed yet
      expect(get(c)).toEqual(6); // now that it is recomputed, use the new b value
      expect(multiply).toHaveBeenCalledTimes(2);
    });

    it('should not recompute (with get) if dependent stores did not change', () => {
      const a = writable(1);
      const double = vi.fn(() => a() * 2);
      const b = computed(double);
      expect(double).not.toHaveBeenCalled();
      expect(b()).toEqual(2);
      expect(double).toHaveBeenCalledTimes(1);
      expect(b()).toEqual(2); // no change, should not recompute
      expect(double).toHaveBeenCalledTimes(1);
      a.set(2);
      expect(double).toHaveBeenCalledTimes(1); // not yet requested, should not have computed yet
      expect(b()).toEqual(4);
      expect(double).toHaveBeenCalledTimes(2);
      a.set(3);
      a.set(2); // coming back to the value previously used to compute b
      expect(b()).toEqual(4);
      expect(double).toHaveBeenCalledTimes(2);
    });

    it('should not recompute (with permanent subscription) if dependent stores did not change', () => {
      const a = writable(1);
      const double = vi.fn(() => a() * 2);
      const b = computed(double);
      expect(double).not.toHaveBeenCalled();
      const bValues: number[] = [];
      const unsubscribe = b.subscribe((value) => {
        bValues.push(value);
      });
      expect(bValues).toEqual([2]);
      expect(double).toHaveBeenCalledTimes(1);
      batch(() => {
        a.set(3);
        a.set(1);
      });
      expect(bValues).toEqual([2]);
      expect(double).toHaveBeenCalledTimes(1);
      batch(() => {
        a.set(4);
        expect(b()).toEqual(8);
        expect(double).toHaveBeenCalledTimes(2);
        expect(bValues).toEqual([2]);
        a.set(1);
      });
      expect(double).toHaveBeenCalledTimes(3);
      expect(bValues).toEqual([2]);
      unsubscribe();
    });

    it('should throw when subscribing to a recursive computed', () => {
      const myValue = computed((): number => myValue());
      const values: number[] = [];
      expect(() => {
        myValue.subscribe((value) => values.push(value));
      }).toThrowError('recursive computed');
      expect(values).toEqual([]);
    });

    it('should throw when setting a value that triggers a recursive computed', () => {
      const recursive = writable(false);
      const myValue = computed((): number => (recursive() ? myValue() : 0));
      const values: number[] = [];
      myValue.subscribe((value) => values.push(value));
      expect(values).toEqual([0]);
      expect(() => {
        recursive.set(true);
      }).toThrowError('recursive computed');
    });

    it('should throw when changing a value from computed would result in an infinite loop (on subscribe)', () => {
      const store = writable(0);
      const wrongComputed = computed(() => {
        const res = store();
        store.set(res + 1);
        return res;
      });
      let reachedSubscriber = false;
      expect(() => {
        wrongComputed.subscribe(() => {
          reachedSubscriber = true;
        });
      }).toThrowError('reached maximum number of store changes in one shot');
      expect(reachedSubscriber).toBe(false);
    });

    it('should throw when changing a value from computed would result in an infinite loop (on set)', () => {
      const store = writable(0);
      const wrongComputed = computed(() => {
        const res = store();
        if (res > 10) {
          store.set(res + 1);
        }
        return res;
      });
      const values: number[] = [];
      wrongComputed.subscribe((value) => {
        values.push(value);
      });
      expect(() => {
        store.set(11);
      }).toThrowError('reached maximum number of store changes in one shot');
      expect(values).toEqual([0]);
    });

    it('should not loop endlessly when using a misbehaving store that calls pause', () => {
      const misbehavingStore = customSimpleWritable(0);
      const values: number[] = [];
      const computedStore = computed(() => get(misbehavingStore));
      const unsubscribe = computedStore.subscribe((value) => values.push(value));
      expect(values).toEqual([0]);
      misbehavingStore.set(1);
      expect(values).toEqual([0, 1]);
      expect(misbehavingStore.subscribers).toHaveLength(1);
      misbehavingStore.subscribers[0].pause?.();
      expect(get(computedStore)).toBe(1);
      unsubscribe();
    });

    it('should give the final value synchronously on subscribe in batch when changing the value inside computed', () => {
      const store = writable(0);
      const fn = vi.fn(() => {
        const value = store();
        if (value < 10) {
          store.set(value + 1);
        }
        return value;
      });
      const computedStore = computed(fn);
      const values: number[] = [];
      batch(() => {
        const unsubscribe = computedStore.subscribe((value) => {
          values.push(value);
        });
        expect(fn).toHaveBeenCalledTimes(11);
        expect(values).toEqual([10]);
        unsubscribe();
      });
    });

    it('should not notify listeners if the final value did not change when changing the value inside computed', () => {
      const store = writable(10);
      const fn = vi.fn(() => {
        const value = store();
        if (value < 10) {
          store.set(value + 1);
        }
        return value;
      });
      const computedStore = computed(fn);
      const values: number[] = [];
      const unsubscribe = computedStore.subscribe((value) => {
        values.push(value);
      });
      expect(fn).toHaveBeenCalledTimes(1);
      expect(values).toEqual([10]);
      store.set(0);
      expect(fn).toHaveBeenCalledTimes(12);
      expect(values).toEqual([10]);
      unsubscribe();
    });

    it('should notify listeners if the final value changed when changing the value inside computed', () => {
      const store = writable(11);
      const fn = vi.fn(() => {
        const value = store();
        if (value < 10) {
          store.set(value + 1);
        }
        return value;
      });
      const computedStore = computed(fn);
      const values: number[] = [];
      const unsubscribe = computedStore.subscribe((value) => {
        values.push(value);
      });
      expect(fn).toHaveBeenCalledTimes(1);
      expect(values).toEqual([11]);
      store.set(0);
      expect(fn).toHaveBeenCalledTimes(12);
      expect(values).toEqual([11, 10]);
      unsubscribe();
    });

    it('should call computed functions only with the final value when changing the value inside a dependent computed', () => {
      const dirtyValue$ = writable(0);
      const minValue$ = writable(0);
      const valueComputedFn = vi.fn(() => {
        const dirtyValue = dirtyValue$();
        const minValue = minValue$();
        if (dirtyValue < minValue) {
          dirtyValue$.set(dirtyValue + 1);
        }
        return dirtyValue;
      });
      const value$ = computed(valueComputedFn);
      const doubleComputedFn = vi.fn(() => value$() * 2);
      const double$ = computed(doubleComputedFn);

      const values: number[] = [];
      const unsubscribeValue = value$.subscribe((value) => {
        values.push(value);
      });

      const doubles: number[] = [];
      const unsubscribeDouble = double$.subscribe((value) => {
        doubles.push(value);
      });

      expect(valueComputedFn).toHaveBeenCalledTimes(1);
      expect(doubleComputedFn).toHaveBeenCalledTimes(1);
      expect(values).toEqual([0]);
      expect(doubles).toEqual([0]);

      minValue$.set(10);
      expect(valueComputedFn).toHaveBeenCalledTimes(12);
      expect(doubleComputedFn).toHaveBeenCalledTimes(2);
      expect(values).toEqual([0, 10]);
      expect(doubles).toEqual([0, 20]);

      unsubscribeValue();
      unsubscribeDouble();
    });

    it('should work with a computed store of a computed store that is paused but finally does not change', () => {
      const a = writable(0);
      const b = writable(0);
      const cFn = vi.fn(() => `a${a()}`);
      const c = computed(cFn);
      const dFn = vi.fn(() => `b${b()}c${c()}`);
      const d = computed(dFn);
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

    it('should be compatible with rxjs (BehaviorSubject)', () => {
      const a = new BehaviorSubject(0);
      const b = computed(() => get(a) + 1);
      const c = computed(() => b() + 1);
      const bValues: number[] = [];
      const cValues: number[] = [];
      const bUnsubscribe = b.subscribe((b) => bValues.push(b));
      const cUnsubscribe = c.subscribe((c) => cValues.push(c));
      expect(bValues).toEqual([1]);
      expect(cValues).toEqual([2]);
      a.next(2);
      expect(bValues).toEqual([1, 3]);
      expect(cValues).toEqual([2, 4]);
      bUnsubscribe();
      cUnsubscribe();
    });
  });
});
