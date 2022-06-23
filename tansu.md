<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@amadeus-it-group/tansu](./tansu.md)

## tansu package

tansu is a lightweight, push-based state management library. It borrows the ideas and APIs originally designed and implemented by [Svelte stores](https://github.com/sveltejs/rfcs/blob/master/text/0002-reactive-stores.md)<!-- -->.

## Classes

|  Class | Description |
|  --- | --- |
|  [DerivedStore](./tansu.derivedstore.md) |  |
|  [Store](./tansu.store.md) | Base class that can be extended to easily create a custom [Readable](./tansu.readable.md) store. |

## Functions

|  Function | Description |
|  --- | --- |
|  [derived(stores, deriveFn, initialValue)](./tansu.derived.md) | A convenience function to create a new store with a state computed from the latest values of dependent stores. Each time the state of one of the dependent stores changes, a provided derive function is called to compute a new, derived state. |
|  [derived(stores, deriveFn, initialValue)](./tansu.derived_1.md) |  |
|  [get(store)](./tansu.get.md) | A utility function to get the current value from a given store. It works by subscribing to a store, capturing the value (synchronously) and unsubscribing just after. |
|  [readable(value, onUseFn)](./tansu.readable.md) | A convenience function to create [Readable](./tansu.readable.md) store instances. |
|  [writable(value, onUseFn)](./tansu.writable.md) | A convenience function to create [Writable](./tansu.writable.md) store instances. |

## Interfaces

|  Interface | Description |
|  --- | --- |
|  [OnUseArgument](./tansu.onuseargument.md) |  |
|  [Readable](./tansu.readable.md) | This interface augments the base [SubscribableStore](./tansu.subscribablestore.md) interface with the Angular-specific <code>OnDestroy</code> callback. The [Readable](./tansu.readable.md) stores can be registered in the Angular DI container and will automatically discard all the subscription when a given store is destroyed. |
|  [SubscribableStore](./tansu.subscribablestore.md) | Represents a store accepting registrations (subscribers) and "pushing" notifications on each and every store value change. |
|  [SubscriberObject](./tansu.subscriberobject.md) | A partial [observer](https://github.com/tc39/proposal-observable#api) notified when a store value changes. A store will call the [next](./tansu.subscriberobject.next.md) method every time the store's state is changing. |
|  [UnsubscribeObject](./tansu.unsubscribeobject.md) | An object with the <code>unsubscribe</code> method. Subscribable stores might choose to return such object instead of directly returning [UnsubscribeFunction](./tansu.unsubscribefunction.md) from a subscription call. |
|  [Writable](./tansu.writable.md) | Builds on top of [Readable](./tansu.readable.md) and represents a store that can be manipulated from "outside": anyone with a reference to writable store can either update or completely replace state of a given store. |

## Variables

|  Variable | Description |
|  --- | --- |
|  [batch](./tansu.batch.md) | Batches multiple changes to stores while calling the provided function, preventing derived stores from updating until the function returns, to avoid unnecessary recomputations. |

## Type Aliases

|  Type Alias | Description |
|  --- | --- |
|  [Subscriber](./tansu.subscriber.md) | Expresses interest in store value changes over time. It can be either: - a callback function: [SubscriberFunction](./tansu.subscriberfunction.md)<!-- -->; - a partial observer: [SubscriberObject](./tansu.subscriberobject.md)<!-- -->. |
|  [SubscriberFunction](./tansu.subscriberfunction.md) | A callback invoked when a store value changes. It is called with the latest value of a given store. |
|  [UnsubscribeFunction](./tansu.unsubscribefunction.md) | A function to unsubscribe from value change notifications. |
|  [Unsubscriber](./tansu.unsubscriber.md) |  |
|  [Updater](./tansu.updater.md) | A function that can be used to update store's value. This function is called with the current value and should return new store value. |
