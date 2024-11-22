import { RawStoreFlags } from './store';
import { checkNotInNotificationPhase, RawStoreWritable } from './storeWritable';
import { activeConsumer, untrack } from './untrack';

let flushUnusedQueue: RawStoreTrackingUsage<any>[] | null = null;
let inFlushUnused = false;

export const flushUnused = (): void => {
  // Ignoring coverage for the following lines because, unless there is a bug in tansu (which would have to be fixed!)
  // there should be no way to trigger this error.
  /* v8 ignore next 3 */
  if (inFlushUnused) {
    throw new Error('assert failed: recursive flushUnused call');
  }
  inFlushUnused = true;
  try {
    const queue = flushUnusedQueue;
    if (queue) {
      flushUnusedQueue = null;
      for (let i = 0, l = queue.length; i < l; i++) {
        const producer = queue[i];
        producer.flags &= ~RawStoreFlags.FLUSH_PLANNED;
        producer.checkUnused();
      }
    }
  } finally {
    inFlushUnused = false;
  }
};

export abstract class RawStoreTrackingUsage<T> extends RawStoreWritable<T> {
  abstract startUse(): void;
  abstract endUse(): void;

  override updateValue(): void {
    const flags = this.flags;
    if (!(flags & RawStoreFlags.START_USE_CALLED)) {
      // Ignoring coverage for the following lines because, unless there is a bug in tansu (which would have to be fixed!)
      // there should be no way to trigger this error.
      /* v8 ignore next 3 */
      if (!(flags & RawStoreFlags.INSIDE_GET) && !this.consumerLinks?.length) {
        throw new Error('assert failed: untracked producer usage');
      }
      this.flags |= RawStoreFlags.START_USE_CALLED;
      untrack(() => this.startUse());
    }
  }

  override checkUnused(): void {
    const flags = this.flags;
    // Ignoring coverage for the following lines because, unless there is a bug in tansu (which would have to be fixed!)
    // there should be no way to trigger this error.
    /* v8 ignore next 3 */
    if (flags & RawStoreFlags.INSIDE_GET) {
      throw new Error('assert failed: INSIDE_GET flag in checkUnused');
    }
    if (flags & RawStoreFlags.START_USE_CALLED && !this.consumerLinks?.length) {
      if (inFlushUnused || flags & RawStoreFlags.HAS_VISIBLE_ONUSE) {
        this.flags &= ~RawStoreFlags.START_USE_CALLED;
        untrack(() => this.endUse());
      } else if (!(flags & RawStoreFlags.FLUSH_PLANNED)) {
        this.flags |= RawStoreFlags.FLUSH_PLANNED;
        if (!flushUnusedQueue) {
          flushUnusedQueue = [];
          queueMicrotask(flushUnused);
        }
        flushUnusedQueue.push(this);
      }
    }
  }

  override get(): T {
    checkNotInNotificationPhase();
    if (activeConsumer) {
      return activeConsumer.addProducer(this);
    } else {
      if (this.flags & RawStoreFlags.INSIDE_GET) {
        throw new Error('recursive computed');
      }
      this.flags |= RawStoreFlags.INSIDE_GET;
      try {
        this.updateValue();
        // Ignoring coverage for the following lines because, unless there is a bug in tansu (which would have to be fixed!)
        // there should be no way to trigger this error.
        /* v8 ignore next 3 */
        if (this.flags & RawStoreFlags.DIRTY) {
          throw new Error('assert failed: store still dirty after updating it');
        }
        return this.readValue();
      } finally {
        this.flags &= ~RawStoreFlags.INSIDE_GET;
        this.checkUnused();
      }
    }
  }
}
