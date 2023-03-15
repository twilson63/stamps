import Account from 'arweave-account';
import { assoc, map, path, prop, compose, concat, filter, propEq, pluck, sortWith, descend, toPairs, take, mergeLeft } from 'ramda';
import { barToAtomic, stampToAtomic, atomicToStamp, winstonToAr, atomicToBar } from './utils.js'
import { getDailyRewards } from './rewards.js'
import { getProfile as getPermapageProfile } from './profile.js'

const arweave = window.Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
})

const { WarpFactory, LoggerFactory } = window.warp
LoggerFactory.INST.logLevel('fatal')

const warp = WarpFactory.forMainnet()

const GATEWAY = 'https://arweave.net'
const REDSTONE_GATEWAY = 'https://gateway.warp.cc'
const CACHE = 'https://cache-2.permaweb.tools'
//const CACHE = 'https://cache.permapages.app'
const DRE = 'https://dre-1.warp.cc'

const TRADE_SOURCE_ID = __TRADE_SOURCE_ID__
const TRADE_SOURCE_OLD = __TRADE_SOURCE_OLD__
const STAMP_CONTRACT = __STAMP_CONTRACT__
const BAR = __BAR_CONTRACT__
const VOUCH_DAO = __VOUCH_DAO__
const STAMP_UNIT = 1e12
const BAR_UNIT = 1e6
const options = { allowBigInt: true, internalWrites: true, unsafeClient: 'allow' }

const account = new Account()
const handlePermaProfile = a => a.profile.handleName === "" ? getPermapageProfile(arweave, [a.addr]).then(mergeLeft(a)) : a

let stampState, barState, vouchState

// async function init() {
//   const stampState = await warp.contract(STAMP_CONTRACT).syncState(CACHE + '/contract', { validity: true })
//     .then(c => c.setEvaluationOptions(options).readState())
//     .then(path(['cachedValue', 'state']))

//   const barState = await warp.contract(BAR).syncState(CACHE + '/contract', { validity: true })
//     .then(c => c.setEvaluationOptions(options).readState())

//   const vouchState = await warp.contract(VOUCH_DAO).syncState(CACHE + '/contract', { validity: true })
//     .then(c => c.setEvaluationOptions(options).readState())

//   return { stampState, barState, vouchState }
// }

// console.time('load')
// init().then(result => {
//   stampState = result.stampState
//   barState = result.barState
//   vouchState = result.vouchState
//   console.timeEnd('load')
// })

function getState() {
  return stampState
  // return warp.contract(STAMP_CONTRACT).setEvaluationOptions({
  //   allowBigInt: true,
  //   internalWrites: true,
  //   unsafeClient: 'allow'
  // }).readState().then(path(['cachedValue', 'state']))
}

export const getTop25 = async () => {
  //const balances = await fetch(`${CACHE}/contract?id=${STAMP_CONTRACT}`).then(res => res.json()).then(r => r.state.balances)
  const balances = await getState().then(prop('balances'))
  const leaders = take(25, sortWith([descend(prop(0))], map(([k, v]) => [v, k], toPairs(balances))))
  // for each leader get account.
  return Promise.all(map(
    ([rewards, address]) => account.get(address)
      .then(handlePermaProfile)
      .then(assoc('rewards', Number(rewards / 1e12).toFixed(4))),
    leaders
  ))

}

export const cancelOrder = async (id) => {
  const stampContract = warp.contract(STAMP_CONTRACT)
    .connect('use_wallet')
    .setEvaluationOptions({
      internalWrites: true,
      allowBigInt: true,
      unsafeClient: 'allow'
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


// export const getVouchUsers = () => fetch(`${DRE}/contract?id=${VOUCH_DAO}&query=$.vouched`)
//   .then(res => res.json()).then(r => r.result[0])
//   .then(vouched => Object.keys(vouched).length)
//   .catch(e => 'N/A')

export const getVouchUsers = () => Promise.resolve(vouchState)
  .then(path(['vouched']))
  .then(vouched => Object.keys(vouched).length)
  .catch(e => 'N/A')

export const getLatestWinners = async () => getDailyRewards(await getState())

export const getRewardHistory = (asset) => getState()
  .then(
    compose(
      map(n => ({ coins: atomicToStamp(n.coins), date: new Date(Number(n.timestamp)).toISOString() })),
      filter(propEq('asset', asset)),
      prop('rewardLog')
    )
  )

async function getStampState() {
  return getState()
}

export async function buyStampCoin(stampCoinQty, stampPrice, addr) {
  try {
    const qty = Number(barToAtomic(stampCoinQty * stampPrice))

    // await warp.contract(BAR).syncState(DRE + '/contract', { validity: true })
    // await warp.contract(STAMP_CONTRACT).syncState(DRE + '/contract', { validity: true })
    // TODO: use warp for this transaction
    const allowTx = await createTransaction(arweave, BAR, {
      function: 'allow',
      target: STAMP_CONTRACT,
      qty
    })
    await arweave.transactions.sign(allowTx, 'use_wallet')
    const transaction = allowTx.id
    await writeInteraction(allowTx)

    const buyTx = await createTransaction(arweave, STAMP_CONTRACT, {
      function: 'createOrder',
      pair: [BAR, STAMP_CONTRACT],
      qty,
      transaction
    }, BAR)

    await arweave.transactions.sign(buyTx, 'use_wallet')
    await writeInteraction(buyTx)

    return fetch(`${DRE}/contract?id=${STAMP_CONTRACT}&query=$`).then(res => res.json()).then(r => r.result[0])
      .then(s => Number(atomicToStamp(s.balances[addr])).toFixed(2))

  } catch (e) {
    console.log(e)

    return Promise.reject(new Error('Transcation was rejected!'))
  }
}

export async function sellStampCoin(stampCoinQty, stampPrice, addr) {
  try {
    const qty = Number(stampToAtomic(stampCoinQty))
    const price = (stampPrice * BAR_UNIT) / STAMP_UNIT
    const sellTx = await createTransaction(arweave, STAMP_CONTRACT, {
      function: 'createOrder',
      pair: [STAMP_CONTRACT, BAR],
      qty,
      price
    })
    await arweave.transactions.sign(sellTx, 'use_wallet')

    await writeInteraction(sellTx)

    return fetch(`${DRE}/contract?id=${STAMP_CONTRACT}&query=$`).then(res => res.json()).then(r => r.result[0])
      .then(s => Number(atomicToStamp(s.balances[addr])).toFixed(2))
  } catch (e) {
    console.log('error', e.message)
    return Promise.reject(new Error('Transcation was rejected!'))
  }
}

export async function getAssetCount() {
  return Promise.all([
    fetch(`${REDSTONE_GATEWAY}/gateway/contracts-by-source?id=${TRADE_SOURCE_ID}`)
      .then(res => res.json())
      .then(data => data.paging.items)
    ,
    fetch(`${REDSTONE_GATEWAY}/gateway/contracts-by-source?id=${TRADE_SOURCE_OLD}`)
      .then(res => res.json())
      .then(data => data.paging.items)
  ])
    .then(([a, b]) => a + b)


}

export async function getStampCount() {
  return getStampState().then(data => Object.keys(data.stamps).length)
}

export async function getAccount(addr) {
  return account.get(addr)
    .then(handlePermaProfile)
  // if no account fallback to permapage

}

export async function getUserAssets(addr) {

  return Promise.all([
    fetch(`${REDSTONE_GATEWAY}/gateway/contracts-by-source?id=${TRADE_SOURCE_ID}`)
      .then(res => res.json())
      .then(data => data.contracts.filter(c => c.owner === addr).length)
    ,
    fetch(`${REDSTONE_GATEWAY}/gateway/contracts-by-source?id=${TRADE_SOURCE_OLD}`)
      .then(res => res.json())
      .then(data => data.contracts.filter(c => c.owner === addr).length)
  ])
    .then(([a, b]) => a + b)
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
  return Promise.resolve(barState)
    .then(state => state.balances[addr] ? state.balances[addr] : 0)
    .then(atomicToBar)
    .then(x => Number(x).toFixed(4))

}


export const getCurrentPrice = async () => {
  return Promise.resolve(stampState)
    .then(s => s.pairs.find(({ pair, orders }) => pair[0] === STAMP_CONTRACT && pair[1] === BAR))

    .then(({ pair, orders }) => orders.reduce((a, v) => v.price < a ? v.price : a, Infinity))

    .then(price => Math.fround(Number(price) * 1e6).toFixed(6))

    .catch(e => {
      return 0
    })

}


async function createTransaction(arweave, contract, input, interact = null) {
  const tx = await arweave.createTransaction({
    data: Math.random().toString().slice(-4),
    reward: '72600854',
    last_tx: 'p7vc1iSP6bvH_fCeUFa9LqoV5qiyW-jdEKouAT0XMoSwrNraB9mgpi29Q10waEpO'
  })

  if (interact) {
    tx.addTag('Interact-Write', interact)
  }
  tx.addTag('App-Name', 'SmartWeaveAction')
  tx.addTag('App-Version', '0.3.0')
  tx.addTag('Contract', contract)
  tx.addTag('Input', JSON.stringify(input))
  tx.addTag('SDK', 'Warp')

  return tx
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