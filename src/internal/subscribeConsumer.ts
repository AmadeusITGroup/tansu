import type { Subscriber, SubscriberObject } from '../types';
import { subscribersQueue } from './batch';
import { updateLinkProducerValue, type BaseLink, type Consumer, type RawStore } from './store';

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

export class SubscribeConsumer<T, Link extends BaseLink<T>> implements Consumer {
  link: Link;
  subscriber: SubscriberObject<T>;
  dirtyCount = 1;
  constructor(producer: RawStore<T, Link>, subscriber: Subscriber<T>) {
    this.subscriber = toSubscriberObject(subscriber);
    this.link = producer.registerConsumer(producer.newLink(this));
    this.notify(true);
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

  notify(first = false): void {
    this.dirtyCount--;
    if (this.dirtyCount === 0 && this.subscriber !== noopSubscriber) {
      const link = this.link;
      const producer = link.producer;
      updateLinkProducerValue(link);
      if (producer.isLinkUpToDate(link) && !first) {
        this.subscriber.resume();
      } else {
        // note that the following line can throw
        const value = producer.updateLink(link);
        this.subscriber.next(value);
      }
    }
  }
}
