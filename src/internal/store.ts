import type {
  SignalStore,
  SubscribableStore,
  Subscriber,
  SubscriberObject,
  UnsubscribeFunction,
  UnsubscribeObject,
  Updater,
} from '../types';
import { batch, subscribersQueue } from './batch';
import { equal } from './equal';
import { activeConsumer } from './untrack';

export let notificationPhase = false;

export const checkNotInNotificationPhase = (): void => {
  if (notificationPhase) {
    throw new Error('Reading or writing a signal is forbidden during the notification phase.');
  }
};

export let epoch = 0;

export interface Consumer {
  markDirty(): void;
}

export interface ProducerConsumerLink<T> {
  value: T;
  version: number;
  producer: RawStore<T>;
  indexInProducer: number;
  consumer: Consumer | null;
  skipMarkDirty: boolean;
}

export const updateLinkProducerValue = <T>(link: ProducerConsumerLink<T>): void => {
  try {
    link.skipMarkDirty = true;
    link.producer.updateValue();
  } finally {
    link.skipMarkDirty = false;
  }
};

export const isLinkUpToDate = <T>(link: ProducerConsumerLink<T>): boolean => {
  const producer = link.producer;
  if (link.version === producer.version) {
    return true;
  }
  if (link.version === producer.version - 1 || link.version < 0) {
    return false;
  }
  if (!producer.equalCache) {
    producer.equalCache = {};
  }
  let res = producer.equalCache[link.version];
  if (res === undefined) {
    res = producer.equal(link.value, producer.value);
    producer.equalCache[link.version] = res;
  }
  return res;
};

export const updateLink = <T>(link: ProducerConsumerLink<T>): T => {
  const producer = link.producer;
  link.value = producer.value;
  link.version = producer.version;
  return producer.readValue();
};

export const enum RawStoreFlags {
  NONE = 0,
  // the following flags are used in RawStoreTrackingUsage and derived classes
  HAS_VISIBLE_ONUSE = 1,
  START_USE_CALLED = 1 << 1,
  INSIDE_GET = 1 << 2,
  FLUSH_PLANNED = 1 << 3,
  // the following flags are used in RawStoreComputedOrDerived and derived classes
  COMPUTING = 1 << 4,
  DIRTY = 1 << 5,
}

export class RawStore<T> implements SignalStore<T>, SubscribableStore<T> {
  constructor(public value: T) {}
  flags = RawStoreFlags.NONE;
  version = 0;
  equalFn = equal<T>;
  equalCache: Record<number, boolean> | null = null;
  consumerLinks: null | ProducerConsumerLink<T>[] = null;

  newLink(consumer: Consumer | null): ProducerConsumerLink<T> {
    return {
      version: -1,
      value: undefined as any,
      producer: this,
      indexInProducer: 0,
      consumer,
      skipMarkDirty: false,
    };
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
          link.consumer?.markDirty?.();
        }
      }
    } finally {
      notificationPhase = prevNotificationPhase;
    }
  }

  get(): T {
    checkNotInNotificationPhase();
    if (activeConsumer) {
      return activeConsumer.addProducer(this);
    } else {
      return this.readValue();
    }
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

export const noop = (): void => {};

const bind = <T>(object: T | null | undefined, fnName: keyof T) => {
  const fn = object ? object[fnName] : null;
  return typeof fn === 'function' ? fn.bind(object) : noop;
};

const noopSubscriber: SubscriberObject<any> = {
  next: noop,
  pause: noop,
  resume: noop,
};

export const toSubscriberObject = <T>(subscriber: Subscriber<T>): SubscriberObject<T> => ({
  next: typeof subscriber === 'function' ? subscriber.bind(null) : bind(subscriber, 'next'),
  pause: bind(subscriber, 'pause'),
  resume: bind(subscriber, 'resume'),
});

export class SubscribeConsumer<T> implements Consumer {
  link: ProducerConsumerLink<T>;
  subscriber: SubscriberObject<T>;
  dirtyCount = 1;
  constructor(producer: RawStore<T>, subscriber: Subscriber<T>) {
    this.subscriber = toSubscriberObject(subscriber);
    this.link = producer.registerConsumer(producer.newLink(this));
    this.notify();
  }

  unsubscribe(): void {
    if (this.subscriber !== noopSubscriber) {
      this.subscriber = noopSubscriber;
      this.link.producer.unregisterConsumer(this.link);
    }
  }

  markDirty(): void {
    this.dirtyCount++;
    subscribersQueue.push(this);
    if (this.dirtyCount === 1) {
      this.subscriber.pause();
    }
  }

  notify(): void {
    this.dirtyCount--;
    if (this.dirtyCount === 0 && this.subscriber !== noopSubscriber) {
      updateLinkProducerValue(this.link);
      if (isLinkUpToDate(this.link)) {
        this.subscriber.resume();
      } else {
        // note that the following line can throw
        const value = updateLink(this.link);
        this.subscriber.next(value);
      }
    }
  }
}
