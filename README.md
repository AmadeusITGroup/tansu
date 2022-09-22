![build](https://github.com/AmadeusITGroup/tansu/workflows/ci/badge.svg) [![codecov](https://codecov.io/gh/AmadeusITGroup/tansu/branch/master/graph/badge.svg)](https://codecov.io/gh/AmadeusITGroup/tansu)

# tansu

tansu is a lightweight, push-based state management library.
It borrows the ideas and APIs originally designed and implemented by [Svelte stores](https://github.com/sveltejs/rfcs/blob/master/text/0002-reactive-stores.md).

Main characteristics:
* small conceptual surface with expressive and very flexible API (functional and class-based);
* can be used to create "local" (module-level or component-level), collaborating stores;
* can handle both immutable and mutable data;
* results in compact code with the absolute minimum of boilerplate.

Implementation wise, it is a tiny (500 LOC) library without any external dependencies.

## Comparison with the Svelte stores

Tansu is designed to be and to remain fully compatible with Svelte. Nevertheless, it brings several improvements:

### tansu works well with the Angular ecosystem:
* works with the standard `async` pipe out of the box;
* stores can be registered in the DI container at any level (module or component injector).

### a batch function is available

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

```
Arsène Lupin
Sherlock Lupin
Sherlock Holmes
Process end
```

The fullName store successively went through different states, including an inconsistent one, as `Sherlock Lupin` does not exist! Even if it can be seen as just an intermediate state, it is **fundamental** for a state management to only manage consistent data in order to prevent issues and optimize the code.

In Tansu, the [batch function](https://amadeusitgroup.github.io/tansu/tansu.batch.html) is available to defer **synchronously** (another important point) the derived calculation and solve all kind of multiple dependencies issues.

The previous example is resolved this way:

```typescript
import {writable, derived, batch} from '@amadeus-it-group/tansu';

const firstName = writable('Arsène');
const lastName = writable('Lupin');
const fullName = derived([firstName, lastName], ([a, b]) => `${a} ${b}`);
fullName.subscribe((name) => console.log(name)); // logs any change to fullName
batch(() => {
    firstName.set('Sherlock');
    lastName.set('Holmes');
});
console.log('Process end');
```
With the following output:

```
Arsène Lupin
Sherlock Holmes
Process end
```

## Installation

You can add tansu to your project by installing the `@amadeus-it-group/tansu` package using your favorite package manager, ex.:
* `yarn add @amadeus-it-group/tansu`
* `npm install @amadeus-it-group/tansu`

## Usage

Here is an example of an Angular component using a tansu store:

```typescript
import { Component } from "@angular/core";
import { Store, derived } from "@amadeus-it-group/tansu";

// A store is a class extending Store from tansu
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
  `
})
export class AppComponent {
  //  A store can be instantiated directly or registered in the DI container
  counter$ = new CounterStore();

  // One can easily created derived (computed) values by specifying dependant stores and a transformation function
  doubleCounter$ = derived(this.counter$, value => 2 * value);
}
```

While being fairly minimal, this example demonstrates most of the tansu APIs.

Check the [documentation](http://amadeusitgroup.github.io/tansu/) for the complete API and more usage examples.

## Contributing to the project

Please check the [DEVELOPER.md](DEVELOPER.md) for documentation on building and testing the project on your local development machine.

## Credits and the prior art

* [Svelte](https://github.com/sveltejs/rfcs/blob/master/text/0002-reactive-stores.md) gets all the credit for the initial idea and the API design.
* [NgRx component stores](https://hackmd.io/zLKrFIadTMS2T6zCYGyHew?view) solve a similar problem with a different approach.

