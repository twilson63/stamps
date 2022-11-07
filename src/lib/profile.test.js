import { test } from 'uvu'
import * as assert from 'uvu/assert'
import Arweave from 'arweave'
import { getProfiles } from './profile.js'

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
})

test('get profile', async () => {
  const addresses = ['vh-NTHVvlKZqRxc8LyyTNok65yQ55a_PJ1zWLb9G2JI']
  const results = await getProfiles(arweave, addresses)

  assert.equal(results.length, 1)
})

test.run()