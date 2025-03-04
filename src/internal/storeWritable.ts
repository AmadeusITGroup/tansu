import { beginBatch, getActiveConsumer, type Signal, type Watcher } from '../interop';
import type { Subscriber, UnsubscribeFunction, UnsubscribeObject, Updater } from '../types';
import { equal } from './equal';
import type { Consumer, RawStore } from './store';
import { RawStoreFlags } from './store';
import { SubscribeConsumer } from './subscribeConsumer';
import { watchRawStore } from './watch';

export let notificationPhase = false;

export const checkNotInNotificationPhase = (): void => {
  if (notificationPhase) {
    throw new Error('Reading or writing a signal is forbidden during the notification phase.');
  }
};

export let epoch = 0;

export interface ProducerConsumerLink<T> {
  value: T;
  version: number;
  producer: RawStore<T, ProducerConsumerLink<T>>;
  indexInProducer: number;
  consumer: Consumer;
  skipMarkDirty: boolean;
}

export class RawStoreWritable<T> implements RawStore<T, ProducerConsumerLink<T>>, Signal {
  constructor(protected value: T) {}
  flags = RawStoreFlags.NONE;
  private version = 0;
  equalFn = equal<T>;
  private equalCache: Record<number, boolean> | null = null;
  consumerLinks: ProducerConsumerLink<T>[] = [];

  newLink(consumer: Consumer): ProducerConsumerLink<T> {
    return {
      version: -1,
      value: undefined as any,
      producer: this,
      indexInProducer: 0,
      consumer,
      skipMarkDirty: false,
    };
  }

  isLinkUpToDate(link: ProducerConsumerLink<T>): boolean {
    if (link.version === this.version) {
      return true;
    }
    if (link.version === this.version - 1 || link.version < 0) {
      return false;
    }
    let equalCache = this.equalCache;
    if (!equalCache) {
      equalCache = {};
      this.equalCache = equalCache;
    }
    let res = equalCache[link.version];
    if (res === undefined) {
      res = this.equal(link.value, this.value);
      equalCache[link.version] = res;
    }
    return res;
  }

  updateLink(link: ProducerConsumerLink<T>): void {
    link.value = this.value;
    link.version = this.version;
  }

  registerConsumer(link: ProducerConsumerLink<T>): ProducerConsumerLink<T> {
    const consumerLinks = this.consumerLinks;
    const indexInProducer = consumerLinks.length;
    link.indexInProducer = indexInProducer;
    consumerLinks[indexInProducer] = link;
    return link;
  }

  unregisterConsumer(link: ProducerConsumerLink<T>): void {
    const consumerLinks = this.consumerLinks;
    const index = link.indexInProducer;
    // Ignoring coverage for the following lines because, unless there is a bug in tansu (which would have to be fixed!)
    // there should be no way to trigger this error.
    /* v8 ignore next 3 */
    if (consumerLinks[index] !== link) {
      throw new Error('assert failed: invalid indexInProducer');
    }
    // swap with the last item to avoid shifting the array
    const lastConsumerLink = consumerLinks.pop()!;
    const isLast = link === lastConsumerLink;
    if (!isLast) {
      consumerLinks[index] = lastConsumerLink;
      lastConsumerLink.indexInProducer = index;
    } else if (index === 0) {
      this.checkUnused();
    }
  }

  protected checkUnused(): void {}
  updateValue(): void {}

  protected equal(a: T, b: T): boolean {
    const equalFn = this.equalFn;
    return equalFn(a, b);
  }

  protected increaseEpoch(): void {
    epoch++;
    this.markConsumersDirty();
  }

  set(newValue: T): void {
    checkNotInNotificationPhase();
    const same = this.equal(this.value, newValue);
    if (!same) {
      const endBatch = beginBatch();
      let queueError;
      try {
        this.value = newValue;
        this.version++;
        this.equalCache = null;
        this.increaseEpoch();
      } finally {
        queueError = endBatch();
      }
      if (queueError) {
        throw queueError.error;
      }
    }
  }

  update(updater: Updater<T>): void {
    this.set(updater(this.value));
  }

  protected markConsumersDirty(): void {
    const prevNotificationPhase = notificationPhase;
    notificationPhase = true;
    try {
      const consumerLinks = this.consumerLinks;
      for (let i = 0, l = consumerLinks.length; i < l; i++) {
        const link = consumerLinks[i];
        if (link.skipMarkDirty) continue;
        link.consumer.markDirty();
      }
    } finally {
      notificationPhase = prevNotificationPhase;
    }
  }

  get(): T {
    checkNotInNotificationPhase();
    getActiveConsumer()?.addProducer(this);
    return this.readValue();
  }

  readValue(): T {
    return this.value;
  }

  subscribe(subscriber: Subscriber<T>): UnsubscribeFunction & UnsubscribeObject {
    checkNotInNotificationPhase();
    const subscription = new SubscribeConsumer(this, subscriber);
    const unsubscriber = () => subscription.unsubscribe();
    unsubscriber.unsubscribe = unsubscriber;
    return unsubscriber;
  }

  watchSignal(notify: () => void): Watcher {
    return watchRawStore(this, notify);
  }
}
