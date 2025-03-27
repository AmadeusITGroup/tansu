import type { BaseLink, Consumer, RawStore } from './store';

export class RawWatcher implements Consumer {
  producerLinks: BaseLink<any>[] = [];
  dirty = false;
  wrapper?: any;

  constructor(public notifyFn: () => void) {}

  markDirty(): void {
    if (!this.dirty) {
      this.dirty = true;
      this.notifyFn.call(this.wrapper);
    }
  }

  addProducer(producer: RawStore<any>): void {
    const link = producer.newLink(this);
    this.producerLinks.push(link);
    producer.registerConsumer(link);
    link.producer.recCallOnUse();
  }

  removeProducer(producer: RawStore<any>): void {
    const producerLinks = this.producerLinks;
    const index = producerLinks.findIndex((link) => link.producer === producer);
    if (index > -1) {
      const link = producerLinks[index];
      const lastItem = producerLinks.pop()!;
      if (link !== lastItem) {
        producerLinks[index] = lastItem;
      }
      producer.unregisterConsumer(link);
    }
  }
}
