import { readable } from 'svelte/store'
import { query } from './services/sw-cache.js'
import { gql } from './services/arweave.js'
import { stampsByAddress } from './domain/stamps.js'

export const app = {
  stamps: (addr) => stampsByAddress(addr).runWith({ query, gql }).toPromise()
}