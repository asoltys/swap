import { writable } from 'svelte/store';

export const input = writable();
export const output = writable();
export const proposal = writable(Promise.resolve(""));
