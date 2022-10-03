import Account from 'arweave-account';
import { path, prop } from 'ramda';
import { atomicToStamp, winstonToAr, atomicToBar } from './utils.js'

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
const STAMP_CONTRACT = 'aSMILD7cEJr93i7TAVzzMjtci_sGkXcWnqpDkG6UGcA'
const BAR = 'mMffEC07TyoAFAI_O6q_nskj2bT8n4UFvckQ3yELeic'
const account = new Account()

export async function getAssetCount() {
  return fetch(`${REDSTONE_GATEWAY}/gateway/contracts-by-source?id=${TRADE_SOURCE_ID}`)
    .then(res => res.json())
    .then(data => data.paging.items)
}

export async function getStampCount() {
  return fetch(`${CACHE}/${STAMP_CONTRACT}`).then(res => res.json())
    .catch(e => warp
      .contract(STAMP_CONTRACT)
      .setEvaluationOptions({
        internalWrites: true,
        allowBigInt: true,
        allowUnsafeClient: true
      })
      .readState()
      .then(prop('state'))

    )
    .then(data => Object.keys(data.stamps).length)
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
  return fetch(`${CACHE}/${STAMP_CONTRACT}`).then(res => res.ok ? res.json() : Promise.reject(new Error('cache not found')))
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
  return fetch(`${CACHE}/${BAR}`).then(res => res.ok ? res.json() : Promise.reject(new Error('could not get bar balance')))
    .then(state => state.balances[addr] ? state.balances[addr] : 0)
    .then(atomicToBar)
    .then(x => Number(x).toFixed(4))
}

