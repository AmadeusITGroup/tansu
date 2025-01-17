import { createQueue, type QueueItem } from './linkedQueue';
import { RawStoreFlags } from './store';
import { checkNotInNotificationPhase, RawStoreWritable } from './storeWritable';
import { activeConsumer, untrack } from './untrack';

const { shift, add, remove } = createQueue<RawStoreTrackingUsage<any>>();
let inFlushUnused = false;
let plannedFlushUnused = false;

export const flushUnused = (): void => {
  // Ignoring coverage for the following lines because, unless there is a bug in tansu (which would have to be fixed!)
  // there should be no way to trigger this error.
  /* v8 ignore next 3 */
  if (inFlushUnused) {
    throw new Error('assert failed: recursive flushUnused call');
  }
  plannedFlushUnused = false;
  inFlushUnused = true;
  try {
    let producer = shift();
    while (producer) {
      producer.flags &= ~RawStoreFlags.FLUSH_PLANNED;
      producer.checkUnused();
      producer = shift();
    }
  } finally {
    inFlushUnused = false;
  }
};

export abstract class RawStoreTrackingUsage<T>
  extends RawStoreWritable<T>
  implements QueueItem<RawStoreTrackingUsage<any>>
{
  private extraUsages = 0;
  next: RawStoreTrackingUsage<any> | null = null;
  prev: RawStoreTrackingUsage<any> | null = null;
  abstract startUse(): void;
  abstract endUse(): void;

  override updateValue(): void {
    const flags = this.flags;
    if (!(flags & RawStoreFlags.START_USE_CALLED)) {
      // Ignoring coverage for the following lines because, unless there is a bug in tansu (which would have to be fixed!)
      // there should be no way to trigger this error.
      /* v8 ignore next 3 */
      if (!this.extraUsages && !this.consumerFirst) {
        throw new Error('assert failed: untracked producer usage');
      }
      if (flags & RawStoreFlags.FLUSH_PLANNED) {
        remove(this);
        this.flags &= ~RawStoreFlags.FLUSH_PLANNED;
      }
      this.flags |= RawStoreFlags.START_USE_CALLED;
      untrack(() => this.startUse());
    }
  }

  override checkUnused(): void {
    const flags = this.flags;
    if (flags & RawStoreFlags.START_USE_CALLED && !this.extraUsages && !this.consumerFirst) {
      if (inFlushUnused || flags & RawStoreFlags.HAS_VISIBLE_ONUSE) {
        this.flags &= ~RawStoreFlags.START_USE_CALLED;
        untrack(() => this.endUse());
      } else if (!(flags & RawStoreFlags.FLUSH_PLANNED)) {
        this.flags |= RawStoreFlags.FLUSH_PLANNED;
        if (!plannedFlushUnused) {
          plannedFlushUnused = true;
          queueMicrotask(flushUnused);
        }
        add(this);
      }
    }
  }

  override get(): T {
    checkNotInNotificationPhase();
    if (activeConsumer) {
      return activeConsumer.addProducer(this);
    } else {
      this.extraUsages++;
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
        const extraUsages = --this.extraUsages;
        if (extraUsages === 0) {
          this.checkUnused();
        }
      }
    }
  }
}
