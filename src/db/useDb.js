import { useSyncExternalStore } from 'react';
import { getState, subscribe } from './store';

/** Subscribes a component to the whole relational store; re-renders on any commit(). */
export function useDb() {
  return useSyncExternalStore(subscribe, getState, getState);
}
