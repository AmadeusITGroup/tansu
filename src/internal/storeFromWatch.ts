import type { Signal, Watcher } from '../interop';
import { type RawStore, RawStoreFlags } from './store';
import { RawStoreComputedOrDerived } from './storeComputedOrDerived';
import { RawStoreWritable } from './storeWritable';

export class RawStoreFromWatch extends RawStoreComputedOrDerived<undefined> {
  // FIXME: remove HAS_VISIBLE_ONUSE and add a new HAS_INTEROP_DEPENDENCIES ? (so that watcher.stop is called asynchronously)
  override flags = RawStoreFlags.HAS_VISIBLE_ONUSE | RawStoreFlags.DIRTY;
  private watcher: Watcher;

  constructor(interopSignal: Signal) {
    super(undefined as any);
    this.watcher = interopSignal.watchSignal(this.markDirty.bind(this));
  }

  override equal(): boolean {
    return false;
  }

  override startUse(): void {
    this.watcher.start();
    this.flags |= RawStoreFlags.DIRTY;
  }

  override areProducersUpToDate(): boolean {
    return !this.watcher!.update();
  }

  override recompute(): void {
    this.set(undefined);
  }

  override endUse(): void {
    this.watcher.stop();
  }

  protected override increaseEpoch(): void {
    // do nothing
  }
}

const interopSignals = new WeakMap<Signal, RawStoreFromWatch>();
const tansuWatchSignal = RawStoreWritable.prototype.watchSignal;
export const fromInteropSignal = (signal: Signal): RawStore<any> => {
  if (signal.watchSignal === tansuWatchSignal) {
    return signal as RawStoreWritable<any>;
  }
  let store = interopSignals.get(signal);
  if (!store) {
    store = new RawStoreFromWatch(signal);
    interopSignals.set(signal, store);
  }
  return store;
};
