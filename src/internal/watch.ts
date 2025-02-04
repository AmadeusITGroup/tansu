import type { Watcher } from '../types';
import { updateLinkProducerValue, type BaseLink, type Consumer, type RawStore } from './store';
import { noop } from './subscribeConsumer';

export class WatcherConsumer<T, Link extends BaseLink<T>> implements Consumer, Watcher<T> {
  dirty = true;
  link: Link | undefined;
  constructor(
    producer: RawStore<T, Link>,
    private notifyFn: () => void
  ) {
    this.link = producer.registerConsumer(producer.newLink(this));
  }

  isDirty(): boolean {
    return this.dirty;
  }

  markDirty(): void {
    if (!this.dirty) {
      this.dirty = true;
      const notifyFn = this.notifyFn;
      notifyFn();
    }
  }

  update(): boolean {
    if (this.dirty) {
      this.dirty = false;
      const link = this.link!;
      const producer = link.producer;
      updateLinkProducerValue(link);
      if (producer.isLinkUpToDate(link)) {
        return false;
      }
      producer.updateLink(link);
      return true;
    }
    return false;
  }

  get(): T {
    const link = this.link;
    if (!link || this.dirty) {
      throw new Error('invalid watcher state');
    }
    return link.producer.readValue();
  }

  destroy(): void {
    const link = this.link;
    if (link) {
      this.link = undefined;
      this.notifyFn = noop;
      this.dirty = false;
      link.producer.unregisterConsumer(link);
    }
  }
}
