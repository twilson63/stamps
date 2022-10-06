import { writable } from 'svelte/store'

export const profile = writable(null)
export const balances = writable({})