import type { BaseLink, Consumer, RawStore } from './store';
import { RawStoreFlags, updateLinkProducerValue } from './store';
import {
  COMPUTED_ERRORED,
  COMPUTED_UNSET,
  RawStoreComputedOrDerived,
} from './storeComputedOrDerived';
import { epoch, notificationPhase } from './storeWritable';
import { activeConsumer, setActiveConsumer, type ActiveConsumer } from './untrack';

export class RawStoreComputed<T>
  extends RawStoreComputedOrDerived<T>
  implements Consumer, ActiveConsumer
{
  private producerIndex = 0;
  private producerLinks: BaseLink<any>[] | null = null;
  private epoch = -1;

  constructor(private readonly computeFn: () => T) {
    super(COMPUTED_UNSET);
  }

  override increaseEpoch(): void {
    // do nothing
  }

  override updateValue(): void {
    const flags = this.flags;
    if (flags & RawStoreFlags.START_USE_CALLED && this.epoch === epoch) {
      return;
    }
    super.updateValue();
    this.epoch = epoch;
  }

  override get(): T {
    if (
      !activeConsumer &&
      !notificationPhase &&
      this.epoch === epoch &&
      (!(this.flags & RawStoreFlags.HAS_VISIBLE_ONUSE) ||
        this.flags & RawStoreFlags.START_USE_CALLED)
    ) {
      return this.readValue();
    }
    return super.get();
  }

  addProducer<U, L extends BaseLink<U>>(producer: RawStore<U, L>): U {
    let producerLinks = this.producerLinks;
    if (!producerLinks) {
      producerLinks = [];
      this.producerLinks = producerLinks;
    }
    const producerIndex = this.producerIndex;
    let link = producerLinks[producerIndex] as L | undefined;
    if (link?.producer !== producer) {
      if (link) {
        producerLinks.push(link); // push the existing link at the end (to be removed later)
      }
      link = producer.registerConsumer(producer.newLink(this));
    }
    producerLinks[producerIndex] = link;
    this.producerIndex = producerIndex + 1;
    updateLinkProducerValue(link);
    if (producer.flags & RawStoreFlags.HAS_VISIBLE_ONUSE) {
      this.flags |= RawStoreFlags.HAS_VISIBLE_ONUSE;
    }
    return producer.updateLink(link);
  }

  override startUse(): void {
    const producerLinks = this.producerLinks;
    if (producerLinks) {
      for (let i = 0, l = producerLinks.length; i < l; i++) {
        const link = producerLinks[i];
        link.producer.registerConsumer(link);
      }
    }
    this.flags |= RawStoreFlags.DIRTY;
  }

  override endUse(): void {
    const producerLinks = this.producerLinks;
    if (producerLinks) {
      for (let i = 0, l = producerLinks.length; i < l; i++) {
        const link = producerLinks[i];
        link.producer.unregisterConsumer(link);
      }
    }
  }

  override areProducersUpToDate(): boolean {
    const producerLinks = this.producerLinks;
    if (producerLinks) {
      for (let i = 0, l = producerLinks.length; i < l; i++) {
        const link = producerLinks[i];
        const producer = link.producer;
        updateLinkProducerValue(link);
        if (!producer.isLinkUpToDate(link)) {
          return false;
        }
      }
    } else if (this.value === COMPUTED_UNSET) {
      return false;
    }
    return true;
  }

  override recompute(): void {
    let value: T;
    const prevActiveConsumer = setActiveConsumer(this);
    try {
      this.producerIndex = 0;
      this.flags &= ~RawStoreFlags.HAS_VISIBLE_ONUSE;
      const computeFn = this.computeFn;
      value = computeFn();
      this.error = null;
    } catch (error) {
      value = COMPUTED_ERRORED;
      this.error = error;
    } finally {
      setActiveConsumer(prevActiveConsumer);
    }
    // Remove unused producers:
    const producerLinks = this.producerLinks;
    const producerIndex = this.producerIndex;
    if (producerLinks && producerIndex < producerLinks.length) {
      for (let i = 0, l = producerLinks.length - producerIndex; i < l; i++) {
        const link = producerLinks.pop()!;
        link.producer.unregisterConsumer(link);
      }
    }
    this.set(value);
  }
}
