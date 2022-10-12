import Account from 'arweave-account';
import { map, path, prop, compose, filter, propEq } from 'ramda';
import { barToAtomic, stampToAtomic, atomicToStamp, winstonToAr, atomicToBar } from './utils.js'
import { getDailyRewards } from './rewards.js'

const arweave = window.Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
})

const { WarpWebFactory, LoggerFactory } = window.warp
LoggerFactory.INST.logLevel('fatal')

const warp = WarpWebFactory.memCached(arweave)

const GATEWAY = 'https://arweave.net'
const REDSTONE_GATEWAY = 'https://gateway.redstone.finance'
const TRADE_SOURCE_ID = 'BzNLxND_nJEMfcLWShyhU4i9BnzEWaATo6FYFsfsO0Q'
const CACHE = 'https://cache.permapages.app'
const WARP_URL = 'https://d1o5nlqr4okus2.cloudfront.net/gateway/contracts/deploy'
const STAMP_CONTRACT = 'aSMILD7cEJr93i7TAVzzMjtci_sGkXcWnqpDkG6UGcA'
const BAR = 'mMffEC07TyoAFAI_O6q_nskj2bT8n4UFvckQ3yELeic'

const account = new Account()

let stampState = null

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

async function getStampState() {
  if (stampState) {
    return stampState
  }
  return await fetch(`${CACHE}/${STAMP_CONTRACT}`).then(res => res.json())
    .catch(_ => warp.contract(STAMP_CONTRACT).setEvaluationOptions({
      internalWrites: true,
      allowBigInt: true,
      allowUnsafeClient: true
    }).readState().then(prop('state')))
}

export async function buyStampCoin(stampCoinQty, stampPrice, addr) {
  try {
    const qty = Number(barToAtomic(stampCoinQty * stampPrice))
    //const price = Number(barToAtomic(stampPrice))
    console.log('qty', qty)
    const prestate = await getStampState()
    const balance = prestate.balances[addr]

    const allowTx = await allow(qty)

    await new Promise(resolve => setTimeout(resolve, 500))

    await createOrder({
      pair: [BAR, STAMP_CONTRACT],
      qty,
      transaction: allowTx
    })

    await new Promise(resolve => setTimeout(resolve, 500))
    // how to confirm the order is complete?
    stampState = await fetch(`${CACHE}/${STAMP_CONTRACT}`).then(res => res.json())
    const newbalance = stampState.balances[addr]
    if (newbalance != balance + qty) {
      throw new Error('purchase did not work')
    }
    return Number(atomicToStamp(newbalance)).toFixed(2)
  } catch (e) {
    console.log(e)
    return 0
  }
}

export async function sellStampCoin(stampCoinQty, stampPrice, addr) {
  const qty = Number(stampToAtomic(stampCoinQty))
  const price = Number(barToAtomic(stampPrice)) / 1e12
  const prestate = await getStampState()
  const balance = prestate.balances[addr]
  const tx = await arweave.createTransaction({
    data: Math.random().toString().slice(-4),
    reward: '72600854',
    last_tx: 'p7vc1iSP6bvH_fCeUFa9LqoV5qiyW-jdEKouAT0XMoSwrNraB9mgpi29Q10waEpO'
  })
  tx.addTag('App-Name', 'SmartWeaveAction')
  tx.addTag('App-Version', '0.3.0')
  tx.addTag('Contract', STAMP_CONTRACT)
  tx.addTag('Input', JSON.stringify({
    function: 'createOrder',
    pair: [STAMP_CONTRACT, BAR],
    qty,
    price
  }))
  tx.addTag('SDK', 'Warp')

  await arweave.transactions.sign(tx)

  await fetch(`${REDSTONE_GATEWAY}/gateway/sequencer/register`, {
    method: 'POST',
    body: JSON.stringify(tx),
    headers: {
      'Accept-Encoding': 'gzip, deflate, br',
      'Content-Type': 'application/json',
      Accept: 'application/json'
    }
  }).then(res => res.ok ? res.json() : Promise.reject(res))


  await new Promise(resolve => setTimeout(resolve, 500))
  // how to confirm the order is complete?
  stampState = await fetch(`${CACHE}/${STAMP_CONTRACT}`).then(res => res.json())
  const newbalance = stampState.balances[addr]
  if (balance !== (newbalance + qty)) {
    throw new Error('balance does not equal new balance plus qty')
  }

  return Number(atomicToStamp(newbalance)).toFixed(2)
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
  //fetch(`${CACHE}/${BAR}`).then(res => res.ok ? res.json() : Promise.reject(new Error('could not get bar balance')))
  return warp.contract(BAR).readState().then(res => res.state)
    .then(state => state.balances[addr] ? state.balances[addr] : 0)
    .then(atomicToBar)
    .then(x => Number(x).toFixed(4))
}


export const getCurrentPrice = async () => {
  return getStampState()
    .then(s => s.pairs.find(({ pair, orders }) => pair[0] === STAMP_CONTRACT && pair[1] === BAR))
    .then(({ pair, orders }) => orders.reduce((a, v) => v.price < a ? v.price : a, Infinity))
    .then(price => (Number(price) * 1e6).toFixed(2))

}

async function allow(amount) {
  const tx = await arweave.createTransaction({
    data: Math.random().toString().slice(-4),
    reward: '72600854',
    last_tx: 'p7vc1iSP6bvH_fCeUFa9LqoV5qiyW-jdEKouAT0XMoSwrNraB9mgpi29Q10waEpO'
  })
  tx.addTag('App-Name', 'SmartWeaveAction')
  tx.addTag('App-Version', '0.3.0')
  tx.addTag('Contract', BAR)
  tx.addTag('Input', JSON.stringify({
    function: 'allow',
    target: STAMP_CONTRACT,
    qty: amount
  }))
  tx.addTag('SDK', 'Warp')

  await arweave.transactions.sign(tx)

  return await writeInteraction(tx)
    .then(_ => tx.id)
    .then(x => (console.log('allowTx: ', x), x))
}

async function createOrder(input) {
  input.function = 'createOrder'
  const tx = await arweave.createTransaction({
    data: Math.random().toString().slice(-4),
    reward: '72600854',
    last_tx: 'p7vc1iSP6bvH_fCeUFa9LqoV5qiyW-jdEKouAT0XMoSwrNraB9mgpi29Q10waEpO'
  })
  tx.addTag('App-Name', 'SmartWeaveAction')
  tx.addTag('App-Version', '0.3.0')
  tx.addTag('Contract', STAMP_CONTRACT)
  tx.addTag('Input', JSON.stringify(input))
  tx.addTag('SDK', 'Warp')

  await arweave.transactions.sign(tx)

  return await writeInteraction(tx)

}

function writeInteraction(tx) {
  return fetch(`${REDSTONE_GATEWAY}/gateway/sequencer/register`, {
    method: 'POST',
    body: JSON.stringify(tx),
    headers: {
      'Accept-Encoding': 'gzip, deflate, br',
      'Content-Type': 'application/json',
      Accept: 'application/json'
    }
  }).then(res => res.ok ? res.json() : Promise.reject(res))
}