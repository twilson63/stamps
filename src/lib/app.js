const REDSTONE_GATEWAY = 'https://gateway.redstone.finance'
const TRADE_SOURCE_ID = 'BzNLxND_nJEMfcLWShyhU4i9BnzEWaATo6FYFsfsO0Q'
const CACHE = 'https://cache.permapages.app'
const STAMP_CONTRACT = 'aSMILD7cEJr93i7TAVzzMjtci_sGkXcWnqpDkG6UGcA'

export async function getAssetCount() {
  return fetch(`${REDSTONE_GATEWAY}/gateway/contracts-by-source?id=${TRADE_SOURCE_ID}`)
    .then(res => res.json())
    .then(data => data.paging.items)
}

export async function getStampCount() {
  return fetch(`${CACHE}/${STAMP_CONTRACT}`).then(res => res.json())
    .then(data => Object.keys(data.stamps).length)
}