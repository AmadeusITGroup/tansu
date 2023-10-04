<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@amadeus-it-group/tansu](./tansu.md) &gt; [StoreOptions](./tansu.storeoptions.md) &gt; [equal](./tansu.storeoptions.equal.md)

## StoreOptions.equal property

Custom function to compare two values, that should return true if they are equal. It is called when setting a new value to avoid doing anything (such as notifying subscribers) if the value did not change. The default logic (when this option is not present) is to return false if `a` is a function or an object, or if `a` and `b` are different according to `Object.is`<!-- -->.

**Signature:**

```typescript
equal?: (a: T, b: T) => boolean;
```

## Remarks

equal takes precedence over [StoreOptions.notEqual](./tansu.storeoptions.notequal.md) if both are defined.
