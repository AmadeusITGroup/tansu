import type { UnsubscribeFunction, UnsubscribeObject, Unsubscriber } from '../types';

export const noopUnsubscribe = (): void => {};
noopUnsubscribe.unsubscribe = noopUnsubscribe;

export const normalizeUnsubscribe = (
  unsubscribe: Unsubscriber | void | null | undefined
): UnsubscribeFunction & UnsubscribeObject => {
  if (!unsubscribe) {
    return noopUnsubscribe;
  }
  if ((unsubscribe as any).unsubscribe === unsubscribe) {
    return unsubscribe as any;
  }
  const res: any =
    typeof unsubscribe === 'function' ? () => unsubscribe() : () => unsubscribe.unsubscribe();
  res.unsubscribe = res;
  return res;
};
