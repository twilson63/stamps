import Account from 'arweave-account';
import { map, path, prop, compose, concat, filter, propEq, pluck } from 'ramda';
import { barToAtomic, stampToAtomic, atomicToStamp, winstonToAr, atomicToBar } from './utils.js'
import { getDailyRewards } from './rewards.js'

const arweave = window.Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
})

const { WarpFactory, LoggerFactory } = window.warp
LoggerFactory.INST.logLevel('fatal')

const warp = WarpFactory.forMainnet()

const GATEWAY = 'https://arweave.net'
const REDSTONE_GATEWAY = 'https://gateway.redstone.finance'
const CACHE = 'https://cache.permapages.app'

const TRADE_SOURCE_ID = __TRADE_SOURCE_ID__
const STAMP_CONTRACT = __STAMP_CONTRACT__
const BAR = __BAR_CONTRACT__
const VOUCH_DAO = __VOUCH_DAO__
const STAMP_UNIT = 1e12
const BAR_UNIT = 1e6

const account = new Account()

export const cancelOrder = (id) => {
  const stampContract = warp.contract(STAMP_CONTRACT)
    .connect('use_wallet')
    .setEvaluationOptions({
      internalWrites: true,
      allowBigInt: true,
      allowUnsafeClient: true
    })

  return stampContract.writeInteraction({
    function: 'cancelOrder',
    orderID: id
  })
}

export const getOpenOrders = (addr) => getStampState()
  .then(compose(
    filter(propEq('creator', addr)),
    prop('0'),
    pluck('orders'),
    prop('pairs')
  ))
//.then(x => (console.log('orders: ', x), x))


export const getVouchUsers = () => fetch(`https://cache.permapages.app/${VOUCH_DAO}`)
  .then(res => res.json())
  .then(state => Object.keys(state.vouched).length)
  .catch(e => 'N/A')

export const getLatestWinners = () => getDailyRewards(CACHE, STAMP_CONTRACT)

export const getRewardHistory = (asset) => fetch(`${CACHE}/${STAMP_CONTRACT}`)
  .then(res => res.json())
  .then(
    compose(
      map(n => ({ coins: atomicToStamp(n.coins), date: new Date(Number(n.timestamp)).toISOString() })),
      filter(propEq('asset', asset)),
      prop('rewardLog')
    )
  )

let stampState = null
let stampCheckTS = null
async function getStampState() {
  warp.contract(STAMP_CONTRACT).setEvaluationOptions({
    internalWrites: true,
    allowBigInt: true,
    allowUnsafeClient: true
  }).readState() // keep indexDb cache up to date...
    .then(path(['cachedValue', 'state']))
    .then(state => stampState = state)

  // only ping cache every 5 minutes
  if (!stampState) {
    stampCheckTS = Date.now()
    return fetch(`${CACHE}/${STAMP_CONTRACT}`).then(res => res.json())
  } else if (Date.now() < (stampCheckTS + 5 * 60 * 1000)) {
    return stampState
  } else {
    stampCheckTS = Date.now()
    return fetch(`${CACHE}/${STAMP_CONTRACT}`).then(res => res.json())
  }


}

export async function buyStampCoin(stampCoinQty, stampPrice, addr) {
  try {
    const qty = Number(barToAtomic(stampCoinQty * stampPrice))
    const barContract = warp.contract(BAR).connect('use_wallet').setEvaluationOptions({
      internalWrites: true,
      allowBigInt: true
    })
    const stampContract = warp.contract(STAMP_CONTRACT).connect('use_wallet').setEvaluationOptions({
      internalWrites: true,
      allowBigInt: true,
      allowUnsafeClient: true
    })

    const allowTx = await barContract.writeInteraction({
      function: 'allow',
      target: STAMP_CONTRACT,
      qty
    }).then(prop('originalTxId'))

    return await stampContract.writeInteraction({
      function: 'createOrder',
      pair: [BAR, STAMP_CONTRACT],
      qty,
      transaction: allowTx
    })
      .then(_ => stampContract.readState())
      .then(path(['cachedValue', 'state']))
      .then(state => {
        return Number(atomicToStamp(state.balances[addr])).toFixed(2)
      })

  } catch (e) {
    console.log(e)

    return Promise.reject(new Error('Transcation was rejected!'))
  }
}

export async function sellStampCoin(stampCoinQty, stampPrice, addr) {
  const qty = Number(stampToAtomic(stampCoinQty))
  const price = (stampPrice * BAR_UNIT) / STAMP_UNIT
  const stampContract = warp.contract(STAMP_CONTRACT).connect('use_wallet')
    .setEvaluationOptions({
      internalWrites: true,
      allowBigInt: true,
      allowUnsafeClient: true
    })

  return stampContract.writeInteraction({
    function: 'createOrder',
    pair: [STAMP_CONTRACT, BAR],
    qty,
    price
  }).then(_ => stampContract.readState())
    .then(path(['cachedValue', 'state']))
    .then(state => {
      return Number(atomicToStamp(state.balances[addr])).toFixed(2)
    })
}

export async function getAssetCount() {
  return fetch(`${REDSTONE_GATEWAY}/gateway/contracts-by-source?id=${TRADE_SOURCE_ID}`)
    .then(res => res.json())
    .then(data => data.paging.items)
}

export async function getStampCount() {
  return getStampState().then(data => Object.keys(data.stamps).length)
}

export async function getAccount(addr) {
  return account.get(addr)
  // if no account fallback to permapage

}

export async function getUserAssets(addr) {
  const query = `
  query {
    transactions(
      first: 100, 
      owners: ["${addr}"],
      tags: {name: "Contract-Src", values: ["${TRADE_SOURCE_ID}"]}) {
        edges {
          cursor
          node {
            id
          }
        }
      }
  }      
        
  `

  return fetch(`${GATEWAY}/graphql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query
    })
  }).then(res => res.ok ? res.json() : Promise.reject(new Error('Could not get data')))
    .then(data => {
      const edges = path(['data', 'transactions', 'edges'], data)
      if (edges.length === 0) { return 0 }
      const query = `
query {
  transactions(
    first: 100,
    after: "${edges[edges.length - 1].cursor}", 
    owners: ["${addr}"],
    tags: {name: "Contract-Src", values: ["${TRADE_SOURCE_ID}"]}) {
      edges {
        cursor
        node {
          id
        }
      }
    }
}      
      `
      if (edges.length >= 100) {
        return fetch(`${GATEWAY}/graphql`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query
          })
        }).then(res => res.ok ? res.json() : Promise.reject(new Error('Could not get data')))
          .then(path(['data', 'transactions', 'edges']))
          .then(e => e.length + edges.length)
      } else {
        return edges.length
      }
    })

}

export const getStampCoinBalance = async (addr) => {
  return getStampState()
    .then(state => state.balances[addr] ? state.balances[addr] : 0)
    .then(atomicToStamp)
    .then(x => Number(x).toFixed(2))
}

export const getArBalance = async (addr) => {
  return fetch(`${GATEWAY}/wallet/${addr}/balance`)
    .then(res => res.ok ? res.json() : Promise.reject(new Error('could not get AR Balance')))
    .then(winstonToAr)
    .then(x => Number(x).toFixed(4))
}

export const getBARBalance = async (addr) => {
  /*
  return fetch(`${CACHE}/${BAR}`).then(res => res.ok ? res.json() : Promise.reject(new Error('could not get bar balance')))
    .then(state => state.balances[addr] ? state.balances[addr] : 0)
    .then(atomicToBar)
    .then(x => Number(x).toFixed(4))
  /*
return warp.contract(BAR).setEvaluationOptions({
  internalWrites: true,
  allowUnsafeClient: true,
  allowBigInt: true
}).readState()
  .then(path(['cachedValue', 'state']))
  .catch(e => fetch(`${CACHE}/${BAR}`).then(res => res.json()))
  .then(state => state.balances[addr] ? state.balances[addr] : 0)
  .then(atomicToBar)
  .then(x => Number(x).toFixed(4))
*/
}


export const getCurrentPrice = async () => {
  return fetch(`${CACHE}/${STAMP_CONTRACT}`)
    .then(res => res.json())
    // keep indexDb cache up to date...
    //.then(path(['cachedValue', 'state']))

    .then(s => s.pairs.find(({ pair, orders }) => pair[0] === STAMP_CONTRACT && pair[1] === BAR))

    .then(({ pair, orders }) => orders.reduce((a, v) => v.price < a ? v.price : a, Infinity))

    .then(price => Math.fround(Number(price) * 1e6).toFixed(6))

    .catch(e => {
      console.log(e)
      return 0
    })

}