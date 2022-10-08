import fpjson from "fpjson-lang"
import { atomicToStamp } from './utils.js'
import { compose, path, pluck, find, propEq, prop, map, reduce, sort } from 'ramda'

export async function getDailyRewards(CACHE, STAMP_CONTRACT) {
  const state = await fetch(`${CACHE}/${STAMP_CONTRACT}`).then(res => res.json())
  const recent = state.rewardLog[state.rewardLog.length - 1].timestamp
  const rewards = fpjson([
    ['compose',
      ['filter',
        ['propEq', 'timestamp', recent]
      ],
      ['prop', 'rewardLog']
    ]
    , state])
  const coins = reduce((a, o) => ({ ...a, [o.asset]: o.coins }), {}, rewards)
  const query = `
query {
  transactions(ids: [${rewards.map(r => `"${r.asset}"`)}]) {
    edges {
      node {
        id
        owner {
          address
        }
        tags {
          name
          value
        }
      }
    }
  }
}
  `

  const assetInfo = await fetch('https://arweave.net/graphql', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      query
    })
  }).then(res => res.json())
    .then(compose(
      sort((a, b) => Number(a.coins) > Number(b.coins) ? -1 : 1),
      map(compose(
        card => ({ ...card, coins: Number(atomicToStamp(coins[card.id])).toFixed(2) }),
        createCard
      )),
      pluck('node'),
      path(['data', 'transactions', 'edges'])))

  return assetInfo
}


function createCard(n) {
  const tag = (name) => prop('value', find(propEq('name', name), n.tags))
  return ({
    id: n.id,
    title: tag('Title'),
    description: tag('Description'),
    type: tag('Type'),
    creator: n.owner.address
  })
}