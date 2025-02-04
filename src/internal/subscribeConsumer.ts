import type { Subscriber, SubscriberObject } from '../types';
import { afterBatch } from '../interop';
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

export class SubscribeConsumer<T, Link extends BaseLink<T>> implements Consumer {
  private readonly link: Link;
  private subscriber: SubscriberObject<T>;
  dirtyCount = 1;
  constructor(producer: RawStore<T, Link>, subscriber: Subscriber<T>) {
    this.process = this.process.bind(this);
    this.subscriber = toSubscriberObject(subscriber);
    this.link = producer.registerConsumer(producer.newLink(this));
    this.process(true);
  }

  unsubscribe(): void {
    if (this.subscriber !== noopSubscriber) {
      this.subscriber = noopSubscriber;
      this.link.producer.unregisterConsumer(this.link);
    }
  }

  markDirty(): void {
    this.dirtyCount++;
    afterBatch(this.process);
    if (this.dirtyCount === 1) {
      this.subscriber.pause();
    }
  }

  process(first = false): void {
    this.dirtyCount--;
    if (this.dirtyCount === 0 && this.subscriber !== noopSubscriber) {
      const link = this.link;
      const producer = link.producer;
      updateLinkProducerValue(link);
      if (producer.isLinkUpToDate(link) && !first) {
        this.subscriber.resume();
      } else {
        producer.updateLink(link);
        // note that the following line can throw
        this.subscriber.next(producer.readValue());
      }
    }
  }
}
