import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { getDailyRewards } from './rewards.js'
import { fetch } from 'undici'

globalThis.fetch = fetch

const CACHE = 'https://cache.permapages.app'
const STAMP_CONTRACT = 'aSMILD7cEJr93i7TAVzzMjtci_sGkXcWnqpDkG6UGcA'


test('get daily rewards', async () => {
  const results = await getDailyRewards(CACHE, STAMP_CONTRACT)
  console.log(results)
  assert.ok(true)
})

test.run()