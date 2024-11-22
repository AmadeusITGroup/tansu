import type { Subscriber, UnsubscribeFunction, UnsubscribeObject, Updater } from '../types';
import { batch } from './batch';
import { equal } from './equal';
import type { Consumer, RawStore } from './store';
import { RawStoreFlags } from './store';
import { SubscribeConsumer } from './subscribeConsumer';
import { activeConsumer } from './untrack';

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

export class RawStoreWritable<T> implements RawStore<T, ProducerConsumerLink<T>> {
  constructor(public value: T) {}
  flags = RawStoreFlags.NONE;
  private version = 0;
  equalFn = equal<T>;
  private equalCache: Record<number, boolean> | null = null;
  consumerLinks: null | ProducerConsumerLink<T>[] = null;

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

  updateLink(link: ProducerConsumerLink<T>): T {
    link.value = this.value;
    link.version = this.version;
    return this.readValue();
  }

  registerConsumer(link: ProducerConsumerLink<T>): ProducerConsumerLink<T> {
    let consumerLinks = this.consumerLinks;
    if (!consumerLinks) {
      consumerLinks = [];
      this.consumerLinks = consumerLinks;
    }
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
    if (consumerLinks?.[index] !== link) {
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

  checkUnused(): void {}
  updateValue(): void {}

  equal(a: T, b: T): boolean {
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
      batch(() => {
        this.value = newValue;
        this.version++;
        this.equalCache = null;
        this.increaseEpoch();
      });
    }
  }

  update(updater: Updater<T>): void {
    this.set(updater(this.value));
  }

  markConsumersDirty(): void {
    const prevNotificationPhase = notificationPhase;
    notificationPhase = true;
    try {
      const consumerLinks = this.consumerLinks;
      if (consumerLinks) {
        for (let i = 0, l = consumerLinks.length; i < l; i++) {
          const link = consumerLinks[i];
          if (link.skipMarkDirty) continue;
          link.consumer.markDirty();
        }
      }
    } finally {
      notificationPhase = prevNotificationPhase;
    }
  }

  get(): T {
    checkNotInNotificationPhase();
    return activeConsumer ? activeConsumer.addProducer(this) : this.readValue();
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
}
