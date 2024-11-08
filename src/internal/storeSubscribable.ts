import type {
  SubscribableStore,
  SubscriberFunction,
  SubscriberObject,
  UnsubscribeFunction,
} from '../types';
import { RawStoreFlags } from './store';
import { RawStoreTrackingUsage } from './storeTrackingUsage';
import { normalizeUnsubscribe } from './unsubscribe';

export class RawSubscribableWrapper<T> extends RawStoreTrackingUsage<T> {
  subscriber: Pick<SubscriberObject<T>, 'next'> & SubscriberFunction<T> = this.createSubscriber();
  unsubscribe: UnsubscribeFunction | null = null;
  override flags = RawStoreFlags.HAS_VISIBLE_ONUSE;

  constructor(public subscribable: SubscribableStore<T>) {
    super(undefined as any);
  }

  private createSubscriber() {
    const subscriber = (value: T) => this.set(value);
    subscriber.next = subscriber;
    subscriber.pause = () => {
      this.markConsumersDirty();
    };
    return subscriber;
  }

  override startUse(): void {
    this.unsubscribe = normalizeUnsubscribe(this.subscribable.subscribe(this.subscriber));
  }

  override endUse(): void {
    const unsubscribe = this.unsubscribe;
    if (unsubscribe) {
      this.unsubscribe = null;
      unsubscribe();
    }
  }
}
