import type {
  AsyncDeriveFn,
  OnUseArgument,
  StoreInput,
  StoresInput,
  StoresInputValues,
  SyncDeriveFn,
  UnsubscribeFunction,
  Unsubscriber,
} from '../types';
import { getRawStore } from './exposeRawStores';
import type { Consumer, ProducerConsumerLink, RawStore } from './store';
import { isLinkUpToDate, RawStoreFlags, updateLink, updateLinkProducerValue } from './store';
import {
  COMPUTED_ERRORED,
  COMPUTED_UNSET,
  RawStoreComputedOrDerived,
} from './storeComputedOrDerived';
import { normalizeUnsubscribe } from './unsubscribe';

abstract class RawStoreDerived<T, S extends StoresInput>
  extends RawStoreComputedOrDerived<T>
  implements Consumer
{
  arrayMode: boolean;
  producers: RawStore<any>[];
  producerLinks: ProducerConsumerLink<any>[] | null = null;
  cleanUpFn: UnsubscribeFunction | null = null;
  override flags = RawStoreFlags.HAS_VISIBLE_ONUSE | RawStoreFlags.DIRTY;

  constructor(producers: S, initialValue: T) {
    super(initialValue);
    const arrayMode = Array.isArray(producers);
    this.arrayMode = arrayMode;
    this.producers = (
      arrayMode ? (producers as StoreInput<any>[]) : [producers as StoreInput<any>]
    ).map(getRawStore);
  }

  callCleanUpFn(): void {
    const cleanUpFn = this.cleanUpFn;
    if (cleanUpFn) {
      this.cleanUpFn = null;
      cleanUpFn();
    }
  }

  override startUse(): void {
    this.producerLinks = this.producers.map((producer) =>
      producer.registerConsumer(producer.newLink(this))
    );
    this.flags |= RawStoreFlags.DIRTY;
  }

  override endUse(): void {
    this.callCleanUpFn();
    const producerLinks = this.producerLinks;
    this.producerLinks = null;
    if (producerLinks) {
      for (let i = 0, l = producerLinks.length; i < l; i++) {
        const link = producerLinks[i];
        link.producer.unregisterConsumer(link);
      }
    }
  }

  override areProducersUpToDate(): boolean {
    const producerLinks = this.producerLinks!;
    let alreadyUpToDate = this.value !== COMPUTED_UNSET;
    for (let i = 0, l = producerLinks.length; i < l; i++) {
      const link = producerLinks[i];
      updateLinkProducerValue(link);
      if (!isLinkUpToDate(link)) {
        alreadyUpToDate = false;
      }
    }
    return alreadyUpToDate;
  }

  override recompute(): void {
    try {
      this.callCleanUpFn();
      const values = this.producerLinks!.map((link) => updateLink(link));
      this.cleanUpFn = normalizeUnsubscribe(this.derive(this.arrayMode ? values : values[0]));
    } catch (error) {
      this.error = error;
      this.set(COMPUTED_ERRORED);
    }
  }

  protected abstract derive(values: S): void;
}

export class RawStoreDerivedStore<T, S extends StoresInput> extends RawStoreDerived<T, S> {
  constructor(
    stores: S,
    initialValue: T,
    public deriveFn: (values: StoresInputValues<S>) => void
  ) {
    super(stores, initialValue);
  }

  protected override derive(values: StoresInputValues<S>): void {
    const deriveFn = this.deriveFn;
    return deriveFn(values);
  }
}

export class RawStoreSyncDerived<T, S extends StoresInput> extends RawStoreDerived<T, S> {
  constructor(
    stores: S,
    initialValue: T,
    public deriveFn: SyncDeriveFn<T, S>
  ) {
    super(stores, COMPUTED_UNSET);
  }
  protected override derive(values: StoresInputValues<S>): void {
    const deriveFn = this.deriveFn;
    this.set(deriveFn(values));
  }
}

export const createOnUseArg = <T>(store: RawStore<T>): OnUseArgument<T> => {
  const setFn = store.set.bind(store) as any;
  setFn.set = setFn;
  setFn.update = store.update.bind(store);
  return setFn;
};

export class RawStoreAsyncDerived<T, S extends StoresInput> extends RawStoreDerived<T, S> {
  setFn = createOnUseArg(this);
  constructor(
    stores: S,
    initialValue: T,
    public deriveFn: AsyncDeriveFn<T, S>
  ) {
    super(stores, initialValue);
  }
  protected override derive(values: StoresInputValues<S>): Unsubscriber | void {
    const deriveFn = this.deriveFn;
    return deriveFn(values, this.setFn);
  }
}
