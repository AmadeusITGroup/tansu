# Tansu

[![npm](https://img.shields.io/npm/v/@amadeus-it-group/tansu)](https://www.npmjs.com/package/@amadeus-it-group/tansu)
![build](https://github.com/AmadeusITGroup/tansu/workflows/ci/badge.svg)
[![codecov](https://codecov.io/gh/AmadeusITGroup/tansu/branch/master/graph/badge.svg)](https://codecov.io/gh/AmadeusITGroup/tansu)

Tansu is a lightweight, push-based state management library.
It borrows the ideas and APIs originally designed and implemented by [Svelte stores](https://github.com/sveltejs/rfcs/blob/master/text/0002-reactive-stores.md).

Main characteristics:

* small conceptual surface with expressive and very flexible API (functional and class-based);
* can be used to create "local" (module-level or component-level), collaborating stores;
* can handle both immutable and mutable data;
* results in compact code with the absolute minimum of boilerplate.

Implementation wise, it is a tiny (1300 LOC) library without any external dependencies.

## Comparison with the Svelte stores

Tansu is designed to be and to remain fully compatible with Svelte. Nevertheless, it brings several improvements:

### Tansu works well with the Angular ecosystem

* works with the standard `async` pipe out of the box
* stores can be registered in the dependency injection (DI) container at any level (module or component injector)
* stores can be used easily with rxjs because they implement the `InteropObservable` interface
* conversely, rxjs observables (or any object implementing the `InteropObservable` interface) can easily be used with Tansu (e.g. in Tansu `computed` or `derived`).

### A computed function is available

With Svelte `derived` function, it is mandatory to provide explicitly a static list of dependencies when the store is created, for example:

```typescript
import {writable, derived} from 'svelte/store';

const quantity = writable(2);
const unitPrice = writable(10);
const totalPrice = derived([quantity, unitPrice], ([quantity, unitPrice]) => {
  console.log("computing the total price");
  return quantity > 0 ? quantity * unitPrice : 0
});
totalPrice.subscribe((totalPrice) => console.log(totalPrice)); // logs any change to totalPrice
quantity.set(0);
unitPrice.set(20);
```

The output of this example will be:

```text
computing the total price
20
computing the total price
0
computing the total price
```

Note that even when the quantity is 0, the total is recomputed when the unit price changes.

In Tansu, while the same [derived](https://amadeusitgroup.github.io/tansu/tansu.derived.html) function is still available, the [computed](https://amadeusitgroup.github.io/tansu/tansu.computed.html) function is also available, with which it is only necessary to provide a function, and the list of dependencies is detected automatically and dynamically:

```typescript
import {writable, computed} from '@amadeus-it-group/tansu';

const quantity = writable(2);
const unitPrice = writable(10);
const totalPrice = computed(() => {
  console.log("computing the total price");
  return quantity() > 0 ? quantity() * unitPrice() : 0
});
totalPrice.subscribe((totalPrice) => console.log(totalPrice)); // logs any change to totalPrice
quantity.set(0);
unitPrice.set(20);
```

Note that every store created with `store = writable(value)` is a function that returns the value of the store. It is equivalent to `get(store)`.
When getting the value of a store (either by calling the store as a function or by using `get`) from a reactive context (such as the one created by `computed`) the dependency on that store is recorded and any change to that store will trigger a recomputation.

The output of this example will be:

```text
computing the total price
20
computing the total price
0
```

Note that when the quantity is 0, changes to the unit price no longer trigger an update of the total price because the list of dependencies is dynamic (and `unitPrice()` is not called if `quantity()` is `0`).

### A batch function is available

Depending on multiple stores can lead to some issues. Let's have a look at the following example:

```typescript
import {writable, derived} from 'svelte/store';

const firstName = writable('Arsène');
const lastName = writable('Lupin');
const fullName = derived([firstName, lastName], ([a, b]) => `${a} ${b}`);
fullName.subscribe((name) => console.log(name)); // logs any change to fullName
firstName.set('Sherlock');
lastName.set('Holmes');
console.log('Process end');
```

The output of this example will be:

```text
Arsène Lupin
Sherlock Lupin
Sherlock Holmes
Process end
```

The fullName store successively went through different states, including an inconsistent one, as `Sherlock Lupin` does not exist! Even if it can be seen as just an intermediate state, it is **fundamental** for a state management to only manage consistent data in order to prevent issues and optimize the code.

In Tansu, the [batch function](https://amadeusitgroup.github.io/tansu/tansu.batch.html) is available to defer **synchronously** (another important point) the derived (or computed) calculation and solve all kind of multiple dependencies issues.

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

With the following output:

```text
Arsène Lupin
Sherlock Holmes
Process end
```

## Installation

You can add Tansu to your project by installing the `@amadeus-it-group/tansu` package using your favorite package manager, ex.:

* `yarn add @amadeus-it-group/tansu`
* `npm install @amadeus-it-group/tansu`

## Usage

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

While being fairly minimal, this example demonstrates most of the Tansu APIs.

Check the [documentation](http://amadeusitgroup.github.io/tansu/) for the complete API and more usage examples.

## Contributing to the project

Please check the [DEVELOPER.md](DEVELOPER.md) for documentation on building and testing the project on your local development machine.

## Credits and the prior art

* [Svelte](https://github.com/sveltejs/rfcs/blob/master/text/0002-reactive-stores.md) gets all the credit for the initial idea and the API design.
* [NgRx component stores](https://hackmd.io/zLKrFIadTMS2T6zCYGyHew?view) solve a similar problem with a different approach.
