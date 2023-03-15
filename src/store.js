import { writable } from 'svelte/store'
import createMachine from "./lib/machine";
import { useMachine } from "svelte-robot-factory";
import { readState } from './lib/services/index'
import { account } from './lib/services/account'
import { Actions } from './lib/actions/index'

export const profile = writable(null)
export const balances = writable({})

const actions = Actions.init({ readState, account })

const machine = createMachine(actions);

export const robot = useMachine(machine, {});
