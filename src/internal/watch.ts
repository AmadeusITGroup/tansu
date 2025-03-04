import type { Watcher } from '../interop';
import { inFlushUnused, planFlush, type Flushable } from './asyncFlush';
import {
  RawStoreFlags,
  updateLinkProducerValue,
  type BaseLink,
  type Consumer,
  type RawStore,
} from './store';

class WatcherConsumer<T, Link extends BaseLink<T>> implements Consumer, Watcher, Flushable {
  flags = RawStoreFlags.DIRTY;
  private link: Link;
  private usages = 0;
  constructor(
    producer: RawStore<T, Link>,
    private notifyFn: () => void
  ) {
    this.link = producer.newLink(this);
  }

  checkUsed(): void {
    const flags = this.flags;
    if (
      !(flags & RawStoreFlags.START_USE_CALLED) &&
      (this.usages > 0 || flags & RawStoreFlags.START_CALLED)
    ) {
      this.flags |= RawStoreFlags.START_USE_CALLED;
      const link = this.link;
      link.producer.registerConsumer(link);
    }
  }

  checkUnused(explicitStop = false): void {
    const flags = this.flags;
    if (
      flags & RawStoreFlags.START_USE_CALLED &&
      !(this.usages > 0 || flags & RawStoreFlags.START_CALLED)
    ) {
      const link = this.link;
      if (inFlushUnused || explicitStop || link.producer.flags & RawStoreFlags.HAS_VISIBLE_ONUSE) {
        this.flags |= RawStoreFlags.DIRTY;
        this.flags &= ~RawStoreFlags.START_USE_CALLED;
        link.producer.unregisterConsumer(link);
      } else {
        planFlush(this);
      }
    }
  }

  isStarted(): boolean {
    return !!(this.flags & RawStoreFlags.START_CALLED);
  }

  isUpToDate(): boolean {
    const flags = this.flags;
    return !!(flags & RawStoreFlags.START_CALLED) && !(flags & RawStoreFlags.DIRTY);
  }

  markDirty(): void {
    const flags = this.flags;
    if (!(flags & RawStoreFlags.DIRTY)) {
      this.flags |= RawStoreFlags.DIRTY;
      if (flags & RawStoreFlags.START_CALLED) {
        const notifyFn = this.notifyFn;
        notifyFn();
      }
    }
  }

  update(): boolean {
    if (this.flags & RawStoreFlags.DIRTY) {
      this.usages++;
      try {
        this.checkUsed();
        this.flags &= ~RawStoreFlags.DIRTY;
        const link = this.link;
        const producer = link.producer;
        updateLinkProducerValue(link);
        if (producer.isLinkUpToDate(link)) {
          return false;
        }
        producer.updateLink(link);
        return true;
      } finally {
        this.usages--;
        this.checkUnused();
      }
    }
    return false;
  }

  start(): void {
    if (!(this.flags & RawStoreFlags.START_CALLED)) {
      this.flags |= RawStoreFlags.START_CALLED;
      this.checkUsed();
    }
  }

  stop(): void {
    if (this.flags & RawStoreFlags.START_CALLED) {
      this.flags &= ~RawStoreFlags.START_CALLED;
      this.checkUnused(true);
    }
  }
}

const exposeWatcher = <T>(watcherConsumer: WatcherConsumer<T, BaseLink<T>>): Watcher => ({
  isUpToDate: watcherConsumer.isUpToDate.bind(watcherConsumer),
  isStarted: watcherConsumer.isStarted.bind(watcherConsumer),
  update: watcherConsumer.update.bind(watcherConsumer),
  start: watcherConsumer.start.bind(watcherConsumer),
  stop: watcherConsumer.stop.bind(watcherConsumer),
});

export const watchRawStore = <T>(producer: RawStore<T, BaseLink<T>>, notify: () => void): Watcher =>
  exposeWatcher(new WatcherConsumer(producer, notify));
