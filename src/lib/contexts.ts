import { getContext, hasContext } from "svelte";

export const NETWORK = 'network';
export const CREATOR_CONTRACT = 'creatorContract';

export function requireContext<T>(key: any): T {
  if (!hasContext(key)) {
    throw new Error(`Context data for key ${key} not found`);
  }
  return getContext(key);
}