import { RawStoreFlags } from './store';

export interface Flushable {
  flags: RawStoreFlags;
  checkUnused(): void;
}

let flushUnusedQueue: Flushable[] | null = null;
export let inFlushUnused = false;

export const planFlush = (object: Flushable): void => {
  if (!(object.flags & RawStoreFlags.FLUSH_PLANNED)) {
    object.flags |= RawStoreFlags.FLUSH_PLANNED;
    if (!flushUnusedQueue) {
      flushUnusedQueue = [];
      queueMicrotask(flushUnused);
    }
    flushUnusedQueue.push(object);
  }
};

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
