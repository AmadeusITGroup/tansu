import { vi } from 'vitest';
import type { Watcher, Signal } from '../../src/interop';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const mockInteropSignal = () => {
  let signalVersion = 0;
  const updateSignalSpy = vi.fn(() => {});
  const watchers: TestWatcher[] = [];
  const notifyWatchers = () => {
    for (const watcher of watchers) {
      watcher.callNotify();
    }
  };
  class TestWatcher implements Watcher {
    private _version = -1;
    private _started = false;
    private _upToDate = false;
    constructor(private _notify: () => void) {}
    update() {
      if (this._upToDate) {
        return false;
      }
      updateSignalSpy();
      const changed = this._version !== signalVersion;
      this._version = signalVersion;
      this._upToDate = this._started;
      return changed;
    }
    callNotify() {
      if (this._upToDate) {
        this._upToDate = false;
        const notify = this._notify;
        notify();
      }
    }
    start(): void {
      this._started = true;
    }
    stop(): void {
      this._started = false;
      this._upToDate = false;
    }
    isStarted(): boolean {
      return this._started;
    }
    isUpToDate(): boolean {
      return this._upToDate;
    }
  }
  const signal: Signal = {
    watchSignal: vi.fn((notify) => {
      const watcher = new TestWatcher(notify);
      watchers.push(watcher);
      return watcher;
    }),
  };
  return {
    signal,
    watchers,
    updateSignalSpy,
    notifyWatchers,
    incrementVersion: (notify = true) => {
      signalVersion++;
      if (notify) {
        notifyWatchers();
      }
    },
  };
};
