import { updateLinkProducerValue, type BaseLink, type Consumer, type RawStore } from './store';

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

  update(): void {
    try {
      this.dirty = true;
      this.producerLinks.forEach(updateLinkProducerValue);
    } finally {
      this.dirty = false;
    }
  }

  addProducer(producer: RawStore<any>): void {
    const link = producer.newLink(this);
    this.producerLinks.push(link);
    producer.registerConsumer(link);
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
