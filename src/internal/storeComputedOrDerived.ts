import type { Consumer } from './store';
import { RawStoreFlags } from './store';
import { RawStoreTrackingUsage } from './storeTrackingUsage';
import { setActiveConsumer } from './untrack';

const MAX_CHANGE_RECOMPUTES = 1000;

export const COMPUTED_UNSET: any = Symbol('UNSET');
export const COMPUTED_ERRORED: any = Symbol('ERRORED');
export const isComputedSpecialValue = (value: unknown): boolean =>
  value === COMPUTED_UNSET || value === COMPUTED_ERRORED;

export abstract class RawStoreComputedOrDerived<T>
  extends RawStoreTrackingUsage<T>
  implements Consumer
{
  override flags = RawStoreFlags.DIRTY;
  error: any;

  override equal(a: T, b: T): boolean {
    if (isComputedSpecialValue(a) || isComputedSpecialValue(b)) {
      return false;
    }
    return super.equal(a, b);
  }

  markDirty(): void {
    if (!(this.flags & RawStoreFlags.DIRTY)) {
      this.flags |= RawStoreFlags.DIRTY;
      this.markConsumersDirty();
    }
  }

  override readValue(): T {
    const value = this.value;
    if (value === COMPUTED_ERRORED) {
      throw this.error;
    }
    // Ignoring coverage for the following lines because, unless there is a bug in tansu (which would have to be fixed!)
    // there should be no way to trigger this error.
    /* v8 ignore next 3 */
    if (value === COMPUTED_UNSET) {
      throw new Error('assert failed: computed value is not set');
    }
    return value;
  }

  override updateValue(): void {
    if (this.flags & RawStoreFlags.COMPUTING) {
      throw new Error('recursive computed');
    }
    super.updateValue();
    if (!(this.flags & RawStoreFlags.DIRTY)) {
      return;
    }
    this.flags |= RawStoreFlags.COMPUTING;
    const prevActiveConsumer = setActiveConsumer(null);
    try {
      let iterations = 0;
      do {
        do {
          iterations++;
          this.flags &= ~RawStoreFlags.DIRTY;
          if (this.areProducersUpToDate()) {
            return;
          }
        } while (this.flags & RawStoreFlags.DIRTY && iterations < MAX_CHANGE_RECOMPUTES);
        this.recompute();
      } while (this.flags & RawStoreFlags.DIRTY && iterations < MAX_CHANGE_RECOMPUTES);
      if (this.flags & RawStoreFlags.DIRTY) {
        this.flags &= ~RawStoreFlags.DIRTY;
        this.error = new Error('reached maximum number of store changes in one shot');
        this.set(COMPUTED_ERRORED);
      }
    } finally {
      setActiveConsumer(prevActiveConsumer);
      this.flags &= ~RawStoreFlags.COMPUTING;
    }
  }

  abstract areProducersUpToDate(): boolean;
  abstract recompute(): void;
}
