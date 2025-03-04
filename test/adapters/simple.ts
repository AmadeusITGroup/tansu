import {
  afterBatch,
  beginBatch,
  getActiveConsumer,
  setActiveConsumer,
  type Consumer,
  type Signal as InteropSignal,
  type Watcher,
} from '../../src/interop';
import { noopWithBuild, type ReactiveFramework } from './type';

abstract class BaseSignal<T> {
  protected _version = 0;
  protected abstract _getValue(): T;
  private _watchers: { notify: () => void; dirty: boolean }[] = [];

  protected abstract _start(): void;
  protected abstract _stop(): void;

  protected _isStarted() {
    return this._watchers.length > 0;
  }

  watchSignal(notify: () => void): Watcher {
    const object = { notify, dirty: true };
    let version = -1;
    let started = false;
    const res: Watcher = {
      isUpToDate: () => !object.dirty,
      isStarted: () => started,
      update: () => {
        if (object.dirty) {
          if (started) {
            object.dirty = false;
          }
          this._update();
          const changed = this._version !== version;
          version = this._version;
          return changed;
        }
        return false;
      },
      start: () => {
        if (!started) {
          this._watchers.push(object);
          started = true;
          if (this._watchers.length === 1) {
            this._start();
          }
        }
      },
      stop: () => {
        object.dirty = true;
        if (started) {
          const index = this._watchers.indexOf(object);
          if (index !== -1) {
            this._watchers.splice(index, 1);
            started = false;
            if (this._watchers.length === 0) {
              this._stop();
            }
          }
        }
      },
    };
    return res;
  }

  get(): T {
    this._update();
    getActiveConsumer()?.addProducer(this);
    return this._getValue();
  }

  protected _update() {}

  protected _markWatchersDirty() {
    for (const watcher of this._watchers) {
      if (!watcher.dirty) {
        watcher.dirty = true;
        const notify = watcher.notify;
        notify();
      }
    }
  }
}

class Signal<T> extends BaseSignal<T> implements InteropSignal {
  constructor(private _value: T) {
    super();
  }

  protected override _start(): void {}
  protected override _stop(): void {}

  protected override _getValue(): T {
    return this._value;
  }

  set(value: T) {
    if (!Object.is(value, this._value)) {
      const endBatch = beginBatch();
      let queueError;
      try {
        this._version++;
        this._value = value;
        this._markWatchersDirty();
      } finally {
        queueError = endBatch();
      }
      if (queueError) {
        throw queueError.error;
      }
    }
  }
}

const ERROR_VALUE: any = Symbol('error');

class Computed<T> extends BaseSignal<T> implements Consumer {
  private _computing = false;
  private _dirty = true;
  private _error: any = null;
  private _value: T = ERROR_VALUE;
  private _depIndex = 0;
  private _dependencies: {
    signal: InteropSignal;
    watcher: Watcher;
    changed: boolean;
  }[] = [];

  constructor(private _fn: () => T) {
    super();
    this._markDirty = this._markDirty.bind(this);
  }

  private _markDirty() {
    this._dirty = true;
    this._markWatchersDirty();
  }

  protected override _start(): void {
    this._dirty = true;
    for (const dep of this._dependencies) {
      dep.watcher.start();
    }
  }

  protected override _stop(): void {
    for (const dep of this._dependencies) {
      dep.watcher.stop();
    }
  }

  addProducer(signal: InteropSignal) {
    const index = this._depIndex;
    const curDep = this._dependencies[index];
    let dep = curDep;
    if (curDep?.signal !== signal) {
      const watcher = signal.watchSignal(this._markDirty);
      dep = { signal, watcher, changed: true };
      this._dependencies[index] = dep;
      if (curDep) {
        this._dependencies.push(curDep);
      }
      if (this._isStarted()) {
        dep.watcher.start();
      }
    }
    dep.watcher.update();
    dep.changed = false;
    this._depIndex++;
  }

  protected override _getValue(): T {
    const value = this._value;
    if (value === ERROR_VALUE) {
      throw this._error;
    }
    return value;
  }

  private _areDependenciesUpToDate() {
    if (this._version === 0) {
      return false;
    }
    for (let i = 0; i < this._depIndex; i++) {
      const dep = this._dependencies[i];
      if (dep.changed) {
        return false;
      }
      if (dep.watcher.update()) {
        dep.changed = true;
        return false;
      }
    }
    return true;
  }

  protected override _update(): void {
    if (this._computing) {
      throw new Error('Circular dependency detected');
    }
    if (this._dirty || !this._isStarted()) {
      let value;
      let error;
      const prevConsumer = getActiveConsumer();
      this._computing = true;
      try {
        if (this._areDependenciesUpToDate()) {
          return;
        }
        this._depIndex = 0;
        setActiveConsumer(this);
        const fn = this._fn;
        value = fn();
        setActiveConsumer(null);
        const depIndex = this._depIndex;
        const dependencies = this._dependencies;
        while (dependencies.length > depIndex) {
          dependencies.pop()!.watcher.stop();
        }
        error = null;
      } catch (e) {
        value = ERROR_VALUE;
        error = e;
      } finally {
        this._dirty = false;
        this._computing = false;
        setActiveConsumer(prevConsumer);
      }
      if (!Object.is(value, this._value) || !Object.is(error, this._error)) {
        this._version++;
        this._value = value;
        this._error = error;
      }
    }
  }
}

export const signal = <T>(value: T): Signal<T> => new Signal(value);
export const computed = <T>(fn: () => T): Computed<T> => new Computed(fn);
export const effect = <T>(fn: () => T): (() => void) => {
  let alive = true;
  const c = new Computed(fn);
  const watcher = c.watchSignal(() => {
    if (alive) {
      afterBatch(update);
    }
  });
  const update = () => {
    if (alive) {
      watcher.update();
    }
  };
  watcher.start();
  watcher.update();
  return () => {
    alive = false;
    watcher.stop();
  };
};
export const batch = <T>(fn: () => T): T => {
  let res;
  let queueError;
  const endBatch = beginBatch();
  try {
    res = fn();
  } finally {
    queueError = endBatch();
  }
  if (queueError) {
    throw queueError.error;
  }
  return res;
};

export const simpleFramework: ReactiveFramework = {
  name: 'simple',
  interop: true,
  signal: (initialValue) => {
    const s = signal(initialValue);
    return {
      write: (v) => s.set(v),
      read: () => s.get(),
    };
  },
  computed: (fn) => {
    const c = computed(fn);
    return {
      read: () => c.get(),
    };
  },
  effect,
  withBatch: batch,
  withBuild: noopWithBuild,
};
