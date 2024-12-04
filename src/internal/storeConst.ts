import type { Subscriber, Unsubscriber } from '../types';
import type { BaseLink, Consumer, RawStore } from './store';
import { RawStoreFlags } from './store';
import { checkNotInNotificationPhase } from './storeWritable';
import { noopUnsubscribe } from './unsubscribe';

export class RawStoreConst<T> implements RawStore<T, BaseLink<T>> {
  readonly flags = RawStoreFlags.NONE;
  constructor(private readonly value: T) {}

  newLink(_consumer: Consumer): BaseLink<T> {
    return {
      producer: this,
    };
  }
  registerConsumer(link: BaseLink<T>): BaseLink<T> {
    return link;
  }
  unregisterConsumer(_link: BaseLink<T>): void {}
  updateValue(): void {}
  isLinkUpToDate(_link: BaseLink<T>): boolean {
    return true;
  }
  updateLink(_link: BaseLink<T>): T {
    return this.value;
  }
  get(): T {
    checkNotInNotificationPhase();
    return this.value;
  }
  subscribe(subscriber: Subscriber<T>): Unsubscriber {
    checkNotInNotificationPhase();
    if (typeof subscriber === 'function') {
      subscriber(this.value);
    } else {
      subscriber?.next?.(this.value);
    }
    return noopUnsubscribe;
  }
}
