export interface QueueItem<T> {
  next: T | null;
  prev: T | null;
}

export const createQueue = <T extends QueueItem<T>>(): {
  add: (item: T) => boolean;
  remove: (item: T) => boolean;
  shift: () => T | null;
} => {
  let first: T | null = null;
  let last: T | null = null;

  const remove = (item: T): boolean => {
    const { prev, next } = item;
    if (prev || next || first === item) {
      item.prev = null;
      item.next = null;
      if (prev) {
        prev.next = next;
      } else {
        first = next;
      }
      if (next) {
        next.prev = prev;
      } else {
        last = prev;
      }
      return true;
    }
    return false;
  };

  const add = (item: T): boolean => {
    if (item === last) {
      // already the last in the queue, nothing to do !
      return false;
    }
    const existing = remove(item);
    item.prev = last;
    if (last) {
      last.next = item;
    } else {
      first = item;
    }
    last = item;
    return !existing;
  };

  const shift = (): T | null => {
    const item = first;
    if (item) {
      remove(item);
    }
    return item;
  };

  return {
    add,
    remove,
    shift,
  };
};
