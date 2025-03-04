import { angularFramework } from './angular';
import { simpleFramework } from './simple';
import { svelteFramework } from './svelte';
import { tansuFramework } from './tansu';
import { wrapAdapterWithComputed } from '../generic/wrapAdapter';
import { wrapAdapterWithForceInteropAPI } from '../generic/forceInteropAPI';

export const allFrameworks = [angularFramework, simpleFramework, svelteFramework, tansuFramework];
export const wrappedFrameworks = (() => {
  const res = [];
  for (const base of allFrameworks) {
    if (base.interop === true) {
      res.push(wrapAdapterWithForceInteropAPI(base));
    }
    for (const wrapper of allFrameworks) {
      // only create wrappers between compatible frameworks:
      if (base.interop === wrapper.interop) {
        res.push(wrapAdapterWithComputed(base, wrapper));
      }
    }
  }
  return res;
})();
export const allFrameworksAndWrappers = [...allFrameworks, ...wrappedFrameworks];
