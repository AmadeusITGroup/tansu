import { getActiveConsumer } from '../interop';
import { type Flushable, inFlushUnused, planFlush } from './asyncFlush';
import { RawStoreFlags, type TansuInteropConsumer } from './store';
import { checkNotInNotificationPhase, RawStoreWritable } from './storeWritable';
import { untrack } from './untrack';

export abstract class RawStoreTrackingUsage<T> extends RawStoreWritable<T> implements Flushable {
  private extraUsages = 0;
  abstract startUse(): void;
  abstract endUse(): void;

  override updateValue(): void {
    const flags = this.flags;
    if (!(flags & RawStoreFlags.START_USE_CALLED)) {
      // Ignoring coverage for the following lines because, unless there is a bug in tansu (which would have to be fixed!)
      // there should be no way to trigger this error.
      /* v8 ignore next 3 */
      if (!this.extraUsages && !this.consumerLinks.length) {
        throw new Error('assert failed: untracked producer usage');
      }
      this.flags |= RawStoreFlags.START_USE_CALLED;
      untrack(() => this.startUse());
    }
  }

  override checkUnused(): void {
    const flags = this.flags;
    if (flags & RawStoreFlags.START_USE_CALLED && !this.extraUsages && !this.consumerLinks.length) {
      if (inFlushUnused || flags & RawStoreFlags.HAS_VISIBLE_ONUSE) {
        this.flags &= ~RawStoreFlags.START_USE_CALLED;
        untrack(() => this.endUse());
      } else {
        planFlush(this);
      }
    }
  }

  override get(): T {
    checkNotInNotificationPhase();
    this.extraUsages++;
    try {
      const activeConsumer = getActiveConsumer();
      const addTansuProducer = (activeConsumer as TansuInteropConsumer)?.addTansuProducer;
      if (!addTansuProducer) {
        // tansu calls updateValue in addTansuProducer, so we don't need to call it here
        this.updateValue();
        // Ignoring coverage for the following lines because, unless there is a bug in tansu (which would have to be fixed!)
        // there should be no way to trigger this error.
        /* v8 ignore next 3 */
        if (this.flags & RawStoreFlags.DIRTY) {
          throw new Error('assert failed: store still dirty after updating it');
        }
      }
      if (addTansuProducer) {
        addTansuProducer.call(activeConsumer, this);
      } else if (activeConsumer) {
        activeConsumer.addProducer(this);
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
