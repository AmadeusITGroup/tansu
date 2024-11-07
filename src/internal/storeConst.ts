import type { Subscriber, UnsubscribeFunction, UnsubscribeObject } from '../types';
import type { Consumer, ProducerConsumerLink } from './store';
import { checkNotInNotificationPhase, RawStore, toSubscriberObject } from './store';
import { noopUnsubscribe } from './unsubscribe';

export class RawStoreConst<T> extends RawStore<T> {
  link: ProducerConsumerLink<T> = {
    producer: this,
    consumer: null as any,
    indexInProducer: -1,
    skipMarkDirty: false,
    value: this.value,
    version: this.version,
  };

  override get(): T {
    checkNotInNotificationPhase();
    return this.value;
  }
  override subscribe(subscriber: Subscriber<T>): UnsubscribeFunction & UnsubscribeObject {
    checkNotInNotificationPhase();
    toSubscriberObject(subscriber).next(this.value);
    return noopUnsubscribe;
  }
  override newLink(_consumer: Consumer | null): ProducerConsumerLink<T> {
    return this.link;
  }
  override registerConsumer(link: ProducerConsumerLink<T>): ProducerConsumerLink<T> {
    return link;
  }
  override unregisterConsumer(_link: ProducerConsumerLink<T>): void {}
}
