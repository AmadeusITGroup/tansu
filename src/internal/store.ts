import type { SignalStore, SubscribableStore } from '../types';

export interface Consumer {
  markDirty(): void;
}

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

export interface BaseLink<T> {
  producer: RawStore<T, BaseLink<T>>;
  skipMarkDirty?: boolean;
}

export interface RawStore<T, Link extends BaseLink<T> = BaseLink<T>>
  extends SignalStore<T>,
    SubscribableStore<T> {
  flags: RawStoreFlags;
  newLink(consumer: Consumer): Link;
  registerConsumer(link: Link): Link;
  unregisterConsumer(link: Link): void;
  updateValue(): void;
  isLinkUpToDate(link: Link): boolean;
  updateLink(link: Link): T;
}

export const updateLinkProducerValue = <T>(link: BaseLink<T>): void => {
  try {
    link.skipMarkDirty = true;
    link.producer.updateValue();
  } finally {
    link.skipMarkDirty = false;
  }
};
