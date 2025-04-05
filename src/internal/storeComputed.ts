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
  private producerFirst: BaseLink<any> | null = null;
  private producerLast: BaseLink<any> | null = null;
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
    const nextLink = this.producerLast ? this.producerLast.nextInConsumer : this.producerFirst;
    let link: L;
    if (nextLink?.producer !== producer) {
      // existing link cannot be reused
      link = producer.registerConsumer(producer.newLink(this));
      link.nextInConsumer = nextLink;
      if (this.producerLast) {
        this.producerLast.nextInConsumer = link;
      } else {
        this.producerFirst = link;
      }
    } else {
      link = nextLink as L;
    }
    this.producerLast = link;
    updateLinkProducerValue(link);
    if (producer.flags & RawStoreFlags.HAS_VISIBLE_ONUSE) {
      this.flags |= RawStoreFlags.HAS_VISIBLE_ONUSE;
    }
    return producer.updateLink(link);
  }

  override startUse(): void {
    let link = this.producerFirst;
    while (link) {
      link.producer.registerConsumer(link);
      link = link.nextInConsumer;
    }
    this.flags |= RawStoreFlags.DIRTY;
  }

  override endUse(): void {
    let link = this.producerFirst;
    while (link) {
      link.producer.unregisterConsumer(link);
      link = link.nextInConsumer;
    }
  }

  override areProducersUpToDate(): boolean {
    if (this.value === COMPUTED_UNSET) {
      return false;
    }
    let link = this.producerFirst;
    while (link) {
      const producer = link.producer;
      updateLinkProducerValue(link);
      if (!producer.isLinkUpToDate(link)) {
        return false;
      }
      link = link.nextInConsumer;
    }
    return true;
  }

  override recompute(): void {
    let value: T;
    const prevActiveConsumer = setActiveConsumer(this);
    try {
      this.producerLast = null;
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
    let link: BaseLink<any> | null;
    if (this.producerLast) {
      link = this.producerLast.nextInConsumer;
      this.producerLast.nextInConsumer = null;
    } else {
      link = this.producerFirst;
      this.producerFirst = null;
    }
    while (link) {
      const next = link.nextInConsumer;
      link.producer.unregisterConsumer(link);
      link.nextInConsumer = null;
      link = next;
    }
    this.set(value);
  }
}
