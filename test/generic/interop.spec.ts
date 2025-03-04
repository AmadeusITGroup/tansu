import { describe, expect, it, vi } from 'vitest';
import { allFrameworksAndWrappers } from '../adapters/all';
import { mergeWithFn, type ReactiveFramework } from '../adapters/type';

export const interopTestSuite = (
  framework1: ReactiveFramework,
  framework2: ReactiveFramework,
  framework3: ReactiveFramework
): void => {
  const withBuild = mergeWithFn(framework1.withBuild, framework2.withBuild, framework3.withBuild);
  const withBatch = mergeWithFn(framework1.withBatch, framework2.withBatch, framework3.withBatch);

  describe('live', () => {
    it('should re-run effects only when needed', () => {
      withBuild(() => {
        const signalA = framework1.signal(true);
        const signalB = framework2.signal('B');
        const signalC = framework2.signal('C');
        const effectFn = vi.fn(() => {
          if (signalA.read()) {
            signalB.read();
          } else {
            signalC.read();
          }
        });
        let destroyEffect!: () => void;
        withBatch(() => {
          destroyEffect = framework3.effect(effectFn);
        });
        expect(effectFn).toHaveBeenCalledOnce();
        effectFn.mockClear();
        withBatch(() => {
          signalC.write('C1'); // signalC was never read by effectFn
        });
        expect(effectFn).not.toHaveBeenCalled();
        withBatch(() => {
          signalA.write(false); // signalA was read by effectFn
        });
        expect(effectFn).toHaveBeenCalledOnce();
        effectFn.mockClear();
        withBatch(() => {
          signalB.write('B1'); // signalB was read by effectFn but not in the last run
        });
        expect(effectFn).not.toHaveBeenCalled();
        withBatch(() => {
          signalC.write('C2'); // signalC was read by effectFn in the last run
        });
        expect(effectFn).toHaveBeenCalledOnce();
        effectFn.mockClear();
        withBatch(() => {
          signalA.write(false); // same value as before
          signalC.write('C2'); // same value as before
        });
        expect(effectFn).not.toHaveBeenCalled();
        destroyEffect();
        withBatch(() => {
          signalA.write(true);
        });
        expect(effectFn).not.toHaveBeenCalled();
      });
    });

    it('should re-compute only when needed', () => {
      withBuild(() => {
        const signalA = framework1.signal(true);
        const signalB = framework1.signal('B');
        const signalC = framework1.signal('C');
        const computedFn = vi.fn(() => (signalA.read() ? signalB.read() : signalC.read()));
        const computed = framework2.computed(computedFn);
        let lastValue: string | undefined;
        const effectFn = vi.fn(() => {
          lastValue = computed.read();
        });
        framework3.effect(effectFn);
        expect(lastValue).toBe('B');
        expect(effectFn).toHaveBeenCalledOnce();
        expect(computedFn).toHaveBeenCalledOnce();
        effectFn.mockClear();
        computedFn.mockClear();
        withBatch(() => {
          signalC.write('C1'); // signalC was never read by computedFn
        });
        expect(lastValue).toBe('B');
        expect(effectFn).not.toHaveBeenCalled();
        expect(computedFn).not.toHaveBeenCalled();
        withBatch(() => {
          signalA.write(false); // signalA was read by computedFn
        });
        expect(lastValue).toBe('C1');
        expect(effectFn).toHaveBeenCalledOnce();
        expect(computedFn).toHaveBeenCalledOnce();
        computedFn.mockClear();
        effectFn.mockClear();
        withBatch(() => {
          signalB.write('B1'); // signalB was read by computedFn but not in the last run
        });
        expect(lastValue).toBe('C1');
        expect(computedFn).not.toHaveBeenCalled();
        expect(effectFn).not.toHaveBeenCalled();
        withBatch(() => {
          signalC.write('C2'); // signalC was read by computedFn in the last run
        });
        expect(lastValue).toBe('C2');
        expect(computedFn).toHaveBeenCalledOnce();
        expect(effectFn).toHaveBeenCalledOnce();
        computedFn.mockClear();
        effectFn.mockClear();
        withBatch(() => {
          signalA.write(false); // same value as before
          signalC.write('C2'); // same value as before
        });
        expect(lastValue).toBe('C2');
        expect(computedFn).not.toHaveBeenCalled();
        expect(effectFn).not.toHaveBeenCalled();
      });
    });

    it('should not recompute what did not change', () => {
      withBuild(() => {
        const a = framework1.signal(2);
        const setA = (v: number) => {
          bFn.mockClear();
          cFn.mockClear();
          withBatch(() => a.write(v));
        };
        const bFn = vi.fn(() => Math.floor(a.read() / 2));
        const b = framework2.computed(bFn);
        let lastValue: number | undefined;
        const cFn = vi.fn(() => {
          lastValue = b.read() * 2;
        });
        framework3.effect(cFn);
        expect(lastValue).toBe(2);
        expect(bFn).toHaveBeenCalledOnce();
        expect(cFn).toHaveBeenCalledOnce();
        setA(4);
        expect(lastValue).toBe(4);
        expect(bFn).toHaveBeenCalledOnce();
        expect(cFn).toHaveBeenCalledOnce();
        setA(5);
        expect(lastValue).toBe(4);
        expect(bFn).toHaveBeenCalledOnce();
        expect(cFn).not.toHaveBeenCalled();
        setA(6);
        expect(lastValue).toBe(6);
        expect(bFn).toHaveBeenCalledOnce();
        expect(cFn).toHaveBeenCalledOnce();
      });
    });
  });

  describe('not live', () => {
    it('should re-compute only when needed', () => {
      withBuild(() => {
        const signalA = framework1.signal(true);
        const signalB = framework2.signal('B');
        const signalC = framework1.signal('C');
        const computedFn = vi.fn(() => (signalA.read() ? signalB.read() : signalC.read()));
        const computed = framework2.computed(computedFn);
        expect(computedFn).not.toHaveBeenCalled();
        expect(computed.read()).toBe('B');
        expect(computedFn).toHaveBeenCalledOnce();
        computedFn.mockClear();
        withBatch(() => {
          signalC.write('C1'); // signalC was never read by computedFn
        });
        expect(computedFn).not.toHaveBeenCalled();
        expect(computed.read()).toBe('B');
        expect(computedFn).not.toHaveBeenCalled();
        withBatch(() => {
          signalA.write(false); // signalA was read by computedFn
        });
        expect(computedFn).not.toHaveBeenCalled();
        expect(computed.read()).toBe('C1');
        expect(computedFn).toHaveBeenCalledOnce();
        computedFn.mockClear();
        withBatch(() => {
          signalB.write('B1'); // signalB was read by computedFn but not in the last run
        });
        expect(computedFn).not.toHaveBeenCalled();
        expect(computed.read()).toBe('C1');
        expect(computedFn).not.toHaveBeenCalled();
        withBatch(() => {
          signalC.write('C2'); // signalC was read by computedFn in the last run
        });
        expect(computedFn).not.toHaveBeenCalled();
        expect(computed.read()).toBe('C2');
        expect(computedFn).toHaveBeenCalledOnce();
        computedFn.mockClear();
        withBatch(() => {
          signalA.write(false); // same value as before
          signalC.write('C2'); // same value as before
        });
        expect(computedFn).not.toHaveBeenCalled();
        expect(computed.read()).toBe('C2');
        expect(computedFn).not.toHaveBeenCalled();
      });
    });

    it('should not recompute a computed whose dependency was recomputed with the same value', () => {
      withBuild(() => {
        const a = framework1.signal(2);
        const setA = (v: number) => {
          bFn.mockClear();
          cFn.mockClear();
          withBatch(() => a.write(v));
          expect(bFn).not.toHaveBeenCalled();
          expect(cFn).not.toHaveBeenCalled();
        };
        const bFn = vi.fn(() => Math.floor(a.read() / 2));
        const b = framework2.computed(bFn);
        const cFn = vi.fn(() => b.read() * 2);
        const c = framework3.computed(cFn);
        expect(bFn).not.toHaveBeenCalled();
        expect(cFn).not.toHaveBeenCalled();
        expect(c.read()).toBe(2);
        expect(bFn).toHaveBeenCalledOnce();
        expect(cFn).toHaveBeenCalledOnce();
        setA(4);
        expect(c.read()).toBe(4);
        expect(bFn).toHaveBeenCalledOnce();
        expect(cFn).toHaveBeenCalledOnce();
        setA(5);
        expect(c.read()).toBe(4);
        expect(bFn).toHaveBeenCalledOnce();
        expect(cFn).not.toHaveBeenCalled();
        setA(6);
        expect(c.read()).toBe(6);
        expect(bFn).toHaveBeenCalledOnce();
        expect(cFn).toHaveBeenCalledOnce();
      });
    });
  });
};

for (const f1 of allFrameworksAndWrappers) {
  for (const f2 of allFrameworksAndWrappers) {
    if (f1.interop === f2.interop) {
      for (const f3 of allFrameworksAndWrappers) {
        if (f1.interop === f3.interop) {
          describe(`${f1.name}, ${f2.name}, ${f3.name}`, () => {
            interopTestSuite(f1, f2, f3);
          });
        }
      }
    }
  }
}
