# Tansu

[![npm](https://img.shields.io/npm/v/@amadeus-it-group/tansu)](https://www.npmjs.com/package/@amadeus-it-group/tansu)
![build](https://github.com/AmadeusITGroup/tansu/workflows/ci/badge.svg)
[![codecov](https://codecov.io/gh/AmadeusITGroup/tansu/branch/master/graph/badge.svg)](https://codecov.io/gh/AmadeusITGroup/tansu)

Tansu is a lightweight, push-based framework-agnostic state management library.
It borrows the ideas and APIs originally designed and implemented by [Svelte stores](https://github.com/sveltejs/rfcs/blob/master/text/0002-reactive-stores.md)
and extends them with `computed` and `batch`.

Main characteristics:

* small conceptual surface with expressive and very flexible API (functional and class-based);
* can be used to create "local" (module-level or component-level), collaborating stores;
* can handle both immutable and mutable data;
* results in compact code with the absolute minimum of boilerplate.

Implementation wise, it is a tiny (1300 LOC) library without any external dependencies.

## Installation

You can add Tansu to your project by installing the `@amadeus-it-group/tansu` package using your favorite package manager, ex.:

* `yarn add @amadeus-it-group/tansu`
* `npm install @amadeus-it-group/tansu`

## Usage

Check out the [Tansu API documentation](https://amadeusitgroup.github.io/tansu/).

The functional part of the API to manage your reactive state can be categorized into three distinct groups:

  - Base store: `writable`
  - Computed stores: `derived`, `computed`, `readable`
  - Utilities: `batch`, `asReadable`, `asWritable`

### writable

[api documentation](https://amadeusitgroup.github.io/tansu/functions/writable.html)

**Writable: A Fundamental Building Block**


A `writable` serves as the foundational element of a "store" – a container designed to encapsulate a value, enabling observation and modification of its state. You can change the internal value using the `set` or `update` methods.

To receive notifications whenever the value undergoes a change, the `subscribe()` method, paired with a callback function, can be employed.

#### Basic usage

```typescript
import {writable} from "@amadeus-it-group/tansu";
const value$ = writable(0);

const unsubscribe = values$.subscribe((value) => {
  console.log(`value = ${value}`);
});

value$.set(1);
value$.update((value) => value + 1);
```

output:

```text
  value = 0
  value = 1
  value = 2
```

#### Setup and teardown

The writable's second parameter allows for receiving notifications when at least one subscriber subscribes or when there are no more subscribers.

```typescript
import {writable} from "@amadeus-it-group/tansu";

const value$ = writable(0, () => {
  console.log('At least one subscriber');

  return () => {
    console.log('No more subscriber');
  }
});

const unsubscribe = values$.subscribe((value) => {
  console.log(`value = ${value}`);
});

value$.set(1);
unsubscribe();
```

output:

```text
  At least one subscriber
  value = 0
  value = 1
  No more subscriber
```

### derived

[api documentation](https://amadeusitgroup.github.io/tansu/functions/derived.html)

A `derived` store calculates its value based on one or more other stores provided as parameters.
Since its value is derived from other stores, it is a read-only store and does not have any `set` or `update` methods.

#### Single store

```typescript
import {writable, derived} from "@amadeus-it-group/tansu";

const value$ = writable(1);
const double$ = derived(value$, (value) => value * 2);

double$.subscribe((double) => console.log('Double value', double));
value$.set(2);
```

output:

```text
Double value 2
Double value 4
```

#### Multiple stores

```typescript
import {writable, derived} from "@amadeus-it-group/tansu";

const a$ = writable(1);
const b$ = writable(1);
const sum$ = derived([a$, b$], ([a, b]) => a + b);

sum$.subscribe((sum) => console.log('Sum', sum));
a$.set(2);
```

output:

```text
Sum 2
Sum 3
```

#### Asynchronous set

A `derived` can directly manipulate its value using the set method instead of relying on the returned value of the provided function.
This flexibility allows you to manage asynchronous operations or apply filtering logic before updating the observable's value.

```typescript
import {writable, derived} from "@amadeus-it-group/tansu";

const a$ = writable(0);
const asynchronousDouble$ = derived(a$, (a, set) => {
  const plannedLater = setTimeout(() => set(a * 2));
  return () => {
    // This clean-up function is called if there is no listener anymore,
    // or if the value of a$ changed
    // In this case, the function passed to setTimeout should not be called
    // (if it was not called already)
    clearTimeout(plannedLater);
  };
}, -1);

const evenOnly$ = derived(a$, (a, set) => {
  if (a % 2 === 0) {
      set(a);
  }
}, <number | undefined>undefined);

asynchronousDouble$.subscribe((double) => console.log('Double (asynchronous)', double));
evenOnly$.subscribe((value) => console.log('Even', value));

a$.set(1);
a$.set(2);
```

output:

```text
Double (asynchronous) -1
Even 0
Even 2
Double (asynchronous) 4
```


### computed

[api documentation](https://amadeusitgroup.github.io/tansu/functions/computed.html)

A `computed` store is another variant of a derived store, with the following characteristics:

  - **Implicit Dependencies:** Unlike in a derived store, there is no requirement to explicitly declare dependencies.

  - **Dynamic Dependency Listening:** Dependencies are determined based on their usage. This implies that a dependency not actively used is not automatically "listened" to, optimizing resource utilization.

#### Switch map

This capability to subscribe/unsubscribe to the dependency allows to create switch maps in a natural way.

```typescript
import {writable, computed} from "@amadeus-it-group/tansu";

const switchToA$ = writable(true);
const a$ = writable(1);
const b$ = writable(0);

const computedValue$ = computed(() => {
  if (switchToA$()) {
    console.log('Return a$');
    return a$();
  } else {
    console.log('Return b$');
    return b$();
  }
});

computedValue$.subscribe((value) => console.log('Computed value:', value));
a$.set(2);
switchToA$.set(false);
a$.set(3);
a$.set(4);
switchToA$.set(true);

```

output:

```text
Return a$
Computed value: 1
Return a$
Computed value: 2
Return b$
Computed value: 0
Return a$
Computed value: 4
```

When `switchToA$.set(false)` is called, the subscription to `a$` is canceled, which means that subsequent changes to `a$` will no longer trigger the calculation., which is only performed again when switchToA$ is set back to true.

### readable

[api documentation](https://amadeusitgroup.github.io/tansu/functions/readable.html)

Similar to Svelte stores, this function generates a store where the value cannot be externally modified.

```typescript
import {readable} from '@amadeus-it-group/tansu';

const time = readable(new Date(), (set) => {
  const interval = setInterval(() => {
    set(new Date());
  }, 1000);

  return () => clearInterval(interval);
});
```

### derived vs computed

While derived and computed may appear similar, they exhibit distinct characteristics that can significantly impact effectiveness based on use-cases:

- **Declaration of Dependencies:**
  - `computed`: No explicit declaration of dependencies is required, providing more flexibility in code composition.
  - `derived`: Requires explicit declaration of dependencies.

- **Performance:**
  - `computed`: Better performance by re-running the function only based on changes in the stores involved in the last run.
  - `derived`: Re-run the function each time a dependent store changes.

- **Asynchronous State:**
  - `computed`: Unable to manage asynchronous state.
  - `derived`: Can handle asynchronous state with the `set` method.

- **Skipping Value Emission:**
  - `computed`: Does not provide a mechanism to skip emitting values.
  - `derived`: Allows skipping the emission of values by choosing not to call the provided `set` method.

- **Setup and Teardown:**
  - `computed`: Lacks explicit setup and teardown methods.
  - `derived`: Supports setup and teardown methods, allowing actions such as adding or removing DOM listeners.
  - When the last listener unsubscribes and then subscribes again, the derived function is rerun due to its setup-teardown functionality. In contrast, a computed provides the last value without recomputing if dependencies haven't changed in the meantime.

While `computed` feels more intuitive in many use-cases, `derived` excels in scenarios where `computed` falls short, particularly in managing asynchronous state and providing more granular control over value emissions.

Carefully choosing between them based on specific requirements enhances the effectiveness of state management in your application.

### Getting the value

There are three ways for getting the value of a store:

```typescript
import {writable, get} from "@amadeus-it-group/tansu";

const count$ = writable(1);
const unsubscribe = count$.subscribe((count) => {
  // Will be called with the updated value synchronously first, then each time count$ changes.
  // `unsubscribe` must be called to prevent future calls.
  console.log(count);
});

// A store is also a function that you can call to get the instant value.
console.log(count$());

// Equivalent to
console.log(get(count$));
```

> [!NOTE]
> Getting the instant value implies the subscription and unsubription on the store:
>   - It can be important to know in case of setup/teardown functions.
>   - In the same scope, prefer to store the value once in a local variable instead of calling `store$()` several times.
>
> When called inside a reactive context (i.e. inside a computed), getting the value serves to know and "listen" the dependent stores.


### batch

[api documentation](https://amadeusitgroup.github.io/tansu/functions/batch.html)

Contrary to other libraries like Angular with signals or Svelte with runes, where the callback of a subscription is executed asynchronously (usually referenced as an "effect"), we have maintained the constraint of synchronicity between the store changes and their subscriptions in Tansu.

While it is acceptable for these frameworks to defer these calls since their goals are well-known in advance (to optimize their final rendering), this is not the case for Tansu, where the goal is to be adaptable to any situation.

The problem with synchronous subscriptions is that it can create "glitches". Subscribers and computed store callbacks that are run too many times can create incorrect intermediate values.

See for example the [asymmetric diamond dependency problem](https://github.com/AmadeusITGroup/tansu/pull/31), which still exists in Svelte stores, while it has been fixed in Tansu.

There is also another use case.

Let's have a look at the following example:

```typescript
import {writable, derived} from '@amadeus-it-group/tansu';

const firstName = writable('Arsène');
const lastName = writable('Lupin');
const fullName = derived([firstName, lastName], ([a, b]) => `${a} ${b}`);
fullName.subscribe((name) => console.log(name)); // logs any change to fullName
firstName.set('Sherlock');
lastName.set('Holmes');
console.log('Process end');
```

output:

```text
Arsène Lupin
Sherlock Lupin
Sherlock Holmes
Process end
```

The fullName store successively went through different states, including an inconsistent one, as `Sherlock Lupin` does not exist! Even if it can be seen as just an intermediate state, it is **fundamental** for a state management to only manage consistent data in order to prevent issues and optimize the code.

In Tansu, the `batch` is available to defer **synchronously** the subscribers calls, and de facto the dependent `derived` or `computed` calculation to solve all kind of multiple dependencies issues.

The previous example is resolved this way:

```typescript
import {writable, derived, computed, batch} from '@amadeus-it-group/tansu';

const firstName = writable('Arsène');
const lastName = writable('Lupin');
const fullName = derived([firstName, lastName], ([a, b]) => `${a} ${b}`);
// note that the fullName store could alternatively be create with computed:
// const fullName = computed(() => `${firstName()} ${lastName()}`);
fullName.subscribe((name) => console.log(name)); // logs any change to fullName
batch(() => {
    firstName.set('Sherlock');
    lastName.set('Holmes');
});
console.log('Process end');
```

output:

```text
Arsène Lupin
Sherlock Holmes
Process end
```
> [!NOTE]
> - Retrieving the immediate value of a store (using any of the three methods mentioned earlier: calling `subscribe` with a subscriber that will be called with the value synchronously, using `get` or calling the store as a function) always provides the value based on the up-to-date values of all dependent stores (even if this requires re-computations of a computed or a derived inside the batch)
> - all calls to subscribers (excluding the first synchronous call during the subscribe process) are deferred until the end of the batch
> - if a subscriber has already been notified of a new value inside the batch (for example, when it is a new subscriber registered within the batch), it won't be notified again at the end of the batch if the value remains unchanged. Subscribers are invoked only when the store's value has changed since their last call.
> - `batch` can be called inside `batch`. The subscriber calls are performed at the end of the first batch, synchronously.


### asReadable

[api documentation](https://amadeusitgroup.github.io/tansu/functions/asReadable.html)

`asReadable` returns a new store that exposes only the essential elements needed for subscribing to the store. It also includes any extra methods passed as parameters.

This is useful and widely used to compose a custom store:

  - The first parameter is the writable store,
  - The second parameter is an object to extend the readable store returned.

```typescript
import {writable, asReadable} from "@amadeus-it-group/tansu";

function createCounter(initialValue: number) {
  const store$ = writable(initialValue);

  return asReadable(store$, {
    increment: () => store$.update((value) => value + 1),
    decrement: () => store$.update((value) => value - 1),
    reset: () => store$.set(initialValue)
  });
}

const counter$ = createCounter(0);

counter$.subscribe((value) => console.log('Value: ', value));

counter$.increment();
counter$.reset();
counter$.set(2); // Error, set does not exist
```
output:
```text
Value: 0
Value: 1
Value: 0
(Error thrown !)
```

### asWritable

[api documentation](https://amadeusitgroup.github.io/tansu/functions/asWritable.html)

`asWritable` is almost the same as an `asReadable`, with the key difference being its implementation of the [WritableSignal](https://amadeusitgroup.github.io/tansu/interfaces/WritableSignal.html) interface.

It's useful when you want to connect your computed store to the original one, or implement a custom `set` method. The `set` method can be passed directly in the second parameter or within an object, similar to the usage in `asReadable`.

For example:

```typescript
import {writable, asWritable} from "@amadeus-it-group/tansu";

const number$ = writable(1);
const double$ = computed(() => number$() * 2);
const writableDouble$ = asWritable(double$, (doubleNumber) => {
  number$.set(doubleNumber / 2);
});
/* equivalent to:
  const writableDouble$ = asWritable(double$, {
    set: (doubleNumber) => number$.set(doubleNumber / 2)
  });
*/

writableDouble$.subscribe((value) => console.log('Value: ', value));

writableDouble$.set(2); // Nothing is triggered here, as number$ is already set with 1
writableDouble$.set(4);

```
output:
```text
Value: 2
Value: 4
```

## Integration in frameworks

### Tansu works well with the Svelte framework

Tansu is designed to be and to remain fully compatible with Svelte.

### Tansu works well with the Angular ecosystem

Here is an example of an Angular component using a Tansu store:

```typescript
import { Component } from "@angular/core";
import { AsyncPipe } from '@angular/common';
import { Store, computed, get } from "@amadeus-it-group/tansu";

// A store is a class extending Store from Tansu
class CounterStore extends Store<number> {
  constructor() {
    super(0); // initialize store's value (state)
  }

  // implement state manipulation logic as regular methods
  increment() {
    // create new state based on the current state
    this.update(value => value + 1);
  }

  reset() {
    // replace the entire state with a new value
    this.set(0);
  }
}

@Component({
  selector: "my-app",
  template: `
    <button (click)="counter$.increment()">+</button> <br />

    <!-- store values can be displayed in a template with the standard async pipe -->
    Counter: {{ counter$ | async }} <br />
    Double counter: {{ doubleCounter$ | async }} <br />
  `,
  standalone: true,
  imports: [AsyncPipe]
})
export class App {
  //  A store can be instantiated directly or registered in the DI container
  counter$ = new CounterStore();

  // One can easily create computed values by specifying a transformation function
  doubleCounter$ = computed(() => 2 * get(this.counter$));
}
```

While being fairly minimal, this example demonstrates most of the Tansu APIs with Angular.

* works with the standard `async` pipe out of the box
* stores can be registered in the dependency injection (DI) container at any level (module or component injector)
* stores can be used easily with rxjs because they implement the `InteropObservable` interface
* conversely, rxjs observables (or any object implementing the `InteropObservable` interface) can easily be used with Tansu (e.g. in Tansu `computed` or `derived`).

## Contributing to the project

Please check the [DEVELOPER.md](DEVELOPER.md) for documentation on building and testing the project on your local development machine.

## Credits and the prior art

* [Svelte](https://github.com/sveltejs/rfcs/blob/master/text/0002-reactive-stores.md) gets all the credit for the initial idea and the API design.
* [NgRx component stores](https://hackmd.io/zLKrFIadTMS2T6zCYGyHew?view) solve a similar problem with a different approach.
