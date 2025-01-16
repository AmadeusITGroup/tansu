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
  prevInProducer: ProducerConsumerLink<T> | null;
  nextInProducer: ProducerConsumerLink<T> | null;
  consumer: Consumer;
  skipMarkDirty: boolean;
}

export class RawStoreWritable<T> implements RawStore<T, ProducerConsumerLink<T>> {
  constructor(protected value: T) {}
  flags = RawStoreFlags.NONE;
  private version = 0;
  equalFn = equal<T>;
  private equalCache: Record<number, boolean> | null = null;
  consumerFirst: ProducerConsumerLink<T> | null = null;
  consumerLast: ProducerConsumerLink<T> | null = null;

  newLink(consumer: Consumer): ProducerConsumerLink<T> {
    return {
      version: -1,
      value: undefined as any,
      producer: this,
      nextInProducer: null,
      prevInProducer: null,
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
    // Ignoring coverage for the following lines because, unless there is a bug in tansu (which would have to be fixed!)
    // there should be no way to trigger this error.
    /* v8 ignore next 3 */
    if (link.nextInProducer || link.prevInProducer) {
      throw new Error('assert failed: registerConsumer with already used link');
    }
    link.prevInProducer = this.consumerLast;
    const last = this.consumerLast;
    if (last) {
      last.nextInProducer = link;
    } else {
      this.consumerFirst = link;
    }
    this.consumerLast = link;
    return link;
  }

  unregisterConsumer(link: ProducerConsumerLink<T>): void {
    const next = link.nextInProducer;
    const prev = link.prevInProducer;
    link.nextInProducer = null;
    link.prevInProducer = null;
    if (next) {
      next.prevInProducer = prev;
    } else {
      this.consumerLast = prev;
    }
    if (prev) {
      prev.nextInProducer = next;
    } else {
      this.consumerFirst = next;
      if (!next) {
        this.checkUnused();
      }
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

  protected markConsumersDirty(): void {
    const prevNotificationPhase = notificationPhase;
    notificationPhase = true;
    try {
      let link = this.consumerFirst;
      while (link) {
        if (!link.skipMarkDirty) {
          link.consumer.markDirty();
        }
        link = link.nextInProducer;
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
