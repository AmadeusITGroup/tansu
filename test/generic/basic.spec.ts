import { describe, expect, it, vi } from 'vitest';
import { getActiveConsumer, setActiveConsumer, type Signal } from '../../src/interop';
import { allFrameworksAndWrappers } from '../adapters/all';
import type { ReactiveFramework } from '../adapters/type';
import { mockInteropSignal } from './mockInteropSignal';

const basicTestSuite = (framework: ReactiveFramework): void => {
  it('should read and write a simple signal', () => {
    framework.withBuild(() => {
      const signal = framework.signal(0);
      expect(signal.read()).toBe(0);
      signal.write(1);
      expect(signal.read()).toBe(1);
      signal.write(2);
      expect(signal.read()).toBe(2);
    });
  });

  if (framework.interop === true) {
    it('should call the active consumer when reading a signal, exposing a working watchSignal method', () => {
      framework.withBuild(() => {
        const signal = framework.signal(0);
        const accessedSignals: Signal[] = [];
        setActiveConsumer({
          addProducer(signal) {
            accessedSignals.push(signal);
          },
        });
        expect(accessedSignals).toHaveLength(0);
        signal.read();
        expect(accessedSignals).toHaveLength(1);
        signal.read();
        expect(accessedSignals).toHaveLength(2);
        setActiveConsumer(null);
        expect(accessedSignals[0]).toBe(accessedSignals[1]);
        const interopSignal = accessedSignals[0];
        const notify = vi.fn();
        const watcher = interopSignal.watchSignal(notify);
        expect(watcher.isUpToDate()).toBe(false);
        expect(watcher.isStarted()).toBe(false);
        watcher.start();
        expect(watcher.isStarted()).toBe(true);
        expect(watcher.isUpToDate()).toBe(false);
        expect(watcher.update()).toBe(true);
        expect(watcher.isUpToDate()).toBe(true);
        expect(watcher.update()).toBe(false);
        expect(notify).not.toHaveBeenCalled();
        signal.write(1);
        expect(notify).toHaveBeenCalledOnce();
        notify.mockClear();
        expect(watcher.isUpToDate()).toBe(false);
        expect(watcher.update()).toBe(true);
        watcher.stop();
        expect(watcher.isStarted()).toBe(false);
        expect(watcher.isUpToDate()).toBe(false);
        expect(watcher.update()).toBe(false);
        signal.write(2);
        expect(notify).not.toHaveBeenCalled();
        expect(watcher.isStarted()).toBe(false);
        expect(watcher.isUpToDate()).toBe(false);
        expect(watcher.update()).toBe(true);
        expect(watcher.isStarted()).toBe(false);
        expect(watcher.isUpToDate()).toBe(false);
        signal.write(3);
        expect(notify).not.toHaveBeenCalled();
        expect(watcher.isStarted()).toBe(false);
        expect(watcher.isUpToDate()).toBe(false);
        watcher.start();
        expect(watcher.isStarted()).toBe(true);
        expect(watcher.isUpToDate()).toBe(false);
        expect(watcher.update()).toBe(true);
        watcher.stop();
        expect(watcher.isStarted()).toBe(false);
        expect(watcher.isUpToDate()).toBe(false);
      });
    });

    it('should set a working active consumer when calling a computed function', () => {
      framework.withBuild(() => {
        const signal = mockInteropSignal();
        const computedFn = vi.fn(() => {
          const activeConsumer = getActiveConsumer();
          expect(activeConsumer).not.toBe(null);
          activeConsumer!.addProducer(signal.signal);
          return 0;
        });
        const computed = framework.computed(computedFn);
        expect(computedFn).not.toHaveBeenCalled();
        expect(computed.read()).toBe(0);
        expect(signal.updateSignalSpy).toHaveBeenCalled();
        expect(computedFn).toHaveBeenCalledOnce();
        computedFn.mockClear();
        expect(computed.read()).toBe(0);
        framework.withBatch(() => {
          signal.updateSignalSpy.mockClear();
          signal.incrementVersion();
          expect(signal.updateSignalSpy).not.toHaveBeenCalled();
        });
        expect(computedFn).not.toHaveBeenCalled();
        expect(computed.read()).toBe(0);
        expect(computedFn).toHaveBeenCalledOnce();
        computedFn.mockClear();
        expect(signal.updateSignalSpy).toHaveBeenCalled();
        const stopEffect = framework.effect(() => computed.read());
        const startedWatcher = signal.watchers.find((watcher) => watcher.isStarted());
        expect(startedWatcher).toBeTruthy();
        for (let i = 0; i < 2; i++) {
          // notification with effective change
          framework.withBatch(() => {
            signal.notifyWatchers();
            signal.updateSignalSpy.mockImplementationOnce(() => {
              signal.incrementVersion(false);
            });
            expect(signal.updateSignalSpy).toHaveBeenCalled();
            signal.updateSignalSpy.mockClear();
            expect(computedFn).not.toHaveBeenCalled();
          });
          expect(computedFn).toHaveBeenCalledOnce();
          computedFn.mockClear();

          // notification with no effective change
          framework.withBatch(() => {
            signal.notifyWatchers();
          });
          expect(computedFn).not.toHaveBeenCalled();
        }
        stopEffect();
        expect(signal.watchers.every((watcher) => watcher.isStarted())).toBe(false);
      });
    });
  }
};

for (const framework of [...allFrameworksAndWrappers]) {
  describe(framework.name, () => basicTestSuite(framework));
}
