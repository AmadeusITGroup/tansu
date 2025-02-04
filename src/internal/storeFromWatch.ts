import type { InteropWatcher } from '../types';
import { RawStoreFlags } from './store';
import { COMPUTED_ERRORED, RawStoreComputedOrDerived } from './storeComputedOrDerived';

export class RawStoreFromWatch<T> extends RawStoreComputedOrDerived<T> {
  override flags = RawStoreFlags.HAS_VISIBLE_ONUSE | RawStoreFlags.DIRTY;
  watcher: InteropWatcher<T> | undefined;

  constructor(private readonly watch: (notify: () => void) => InteropWatcher<T>) {
    super(undefined as any);
    this.markDirty = this.markDirty.bind(this);
  }

  override startUse(): void {
    const watch = this.watch;
    this.watcher = watch(this.markDirty);
    this.flags |= RawStoreFlags.DIRTY;
  }

  override areProducersUpToDate(): boolean {
    return !this.watcher!.update();
  }

  override recompute(): void {
    let value;
    try {
      value = this.watcher!.get();
      this.error = null;
    } catch (error) {
      value = COMPUTED_ERRORED;
      this.error = error;
    }
    this.set(value);
  }

  override endUse(): void {
    const watcher = this.watcher;
    if (watcher) {
      this.watcher = undefined;
      watcher.destroy();
    }
  }
}
