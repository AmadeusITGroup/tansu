import type { UnsubscribeFunction, Unsubscriber } from '../types';
import { RawStoreFlags } from './store';
import { RawStoreTrackingUsage } from './storeTrackingUsage';
import { normalizeUnsubscribe } from './unsubscribe';

export class RawStoreWithOnUse<T> extends RawStoreTrackingUsage<T> {
  private cleanUpFn: UnsubscribeFunction | null = null;
  override flags = RawStoreFlags.HAS_VISIBLE_ONUSE;

  constructor(
    value: T,
    private readonly onUseFn: () => Unsubscriber | void
  ) {
    super(value);
  }

  override startUse(): void {
    this.cleanUpFn = normalizeUnsubscribe(this.onUseFn());
  }

  override endUse(): void {
    const cleanUpFn = this.cleanUpFn;
    if (cleanUpFn) {
      this.cleanUpFn = null;
      cleanUpFn();
    }
  }
}
