import type { Subscriber, SubscriberObject } from '../types';
import { addToQueue, removeFromQueue } from './batch';
import type { QueueItem } from './linkedQueue';
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

const toSubscriberObject = <T>(subscriber: Subscriber<T>): SubscriberObject<T> => ({
  next: typeof subscriber === 'function' ? subscriber.bind(null) : bind(subscriber, 'next'),
  pause: bind(subscriber, 'pause'),
  resume: bind(subscriber, 'resume'),
});

export class SubscribeConsumer<T, Link extends BaseLink<T>>
  implements Consumer, QueueItem<SubscribeConsumer<any, any>>
{
  private readonly link: Link;
  private subscriber: SubscriberObject<T>;
  prev: SubscribeConsumer<any, any> | null = null;
  next: SubscribeConsumer<any, any> | null = null;

  constructor(producer: RawStore<T, Link>, subscriber: Subscriber<T>) {
    this.subscriber = toSubscriberObject(subscriber);
    this.link = producer.registerConsumer(producer.newLink(this));
    this.notify(true);
  }

  unsubscribe(): void {
    if (this.subscriber !== noopSubscriber) {
      this.subscriber = noopSubscriber;
      removeFromQueue(this);
      this.link.producer.unregisterConsumer(this.link);
    }
  }

  markDirty(): void {
    if (addToQueue(this)) {
      this.subscriber.pause();
    }
  }

  notify(first = false): void {
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
