import { bench, describe } from 'vitest';
import type { ReadableSignal, Unsubscriber } from '../src';
import { computed, derived, DerivedStore, readable, Store, writable } from '../src';

class StoreClass extends Store<number> {}
class DoubleStoreClass extends DerivedStore<number, ReadableSignal<number>> {
  protected override derive(value: number): Unsubscriber | void {
    this.set(2 * value);
  }
}

describe('creating base stores', () => {
  bench('writable', () => {
    writable(0);
  });
  bench('readable', () => {
    readable(0);
  });

  bench('new StoreClass', () => {
    new StoreClass(0);
  });
});

describe('creating derived stores', () => {
  const baseStore = writable(0);
  bench('computed', () => {
    computed(() => 2 * baseStore());
  });

  bench('derived', () => {
    derived(baseStore, (a) => 2 * a);
  });

  bench('new DoubleStoreClass', () => {
    new DoubleStoreClass(baseStore, 0);
  });
});

describe('updating derived stores', () => {
  const baseStore1 = writable(0);
  computed(() => 2 * baseStore1()).subscribe(() => {});
  let count1 = 0;
  bench('computed', () => {
    count1++;
    baseStore1.set(count1);
  });

  const baseStore2 = writable(0);
  derived(baseStore2, (a) => 2 * a).subscribe(() => {});
  let count2 = 0;
  bench('derived', () => {
    count2++;
    baseStore2.set(count2);
  });

  const baseStore3 = writable(0);
  new DoubleStoreClass(baseStore3, 0).subscribe(() => {});
  let count3 = 0;
  bench('DoubleStoreClass', () => {
    count3++;
    baseStore3.set(count3);
  });
});

describe('updating writable stores', () => {
  const storeWithoutSubscriber = writable(0);
  let count1 = 0;

  bench('without subscriber', () => {
    count1++;
    storeWithoutSubscriber.set(count1);
  });

  const storeWithSubscriber = writable(0);
  storeWithSubscriber.subscribe(() => {});
  let count2 = 0;
  bench('with subscriber', () => {
    count2++;
    storeWithSubscriber.set(count2);
  });
});
