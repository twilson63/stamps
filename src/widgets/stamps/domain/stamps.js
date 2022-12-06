import { Async, ReaderT } from 'crocks'
import { assoc, compose, filter, find, map, propOr, propEq, pluck } from 'ramda'

const { of, ask, lift } = ReaderT(Async)

const STAMP_CONTRACT = 'FMRHYgSijiUNBrFy-XqyNNXenHsCV0ThR4lGAPO4chA'

export const stampsByAddress = (addr) =>
  of(addr)
    .chain(addr => ask(({ query, gql }) =>
      Async.fromPromise(query)(STAMP_CONTRACT,
        ['compose',
          ['filter', ['propEq', 'address', addr]],
          ['values'],
          ['prop', 'stamps']
        ])
        .chain(stamps =>
          Async.of(stamps)
            .map(pluck('asset'))
            .map(buildQuery)
            .chain(Async.fromPromise(gql))
            .map(pluck('node'))
            .map(map(toStamp))
            .map(map(s => {
              s.timestamp = propOr(0, 'timestamp', find(propEq('asset', s.id), stamps))
              return s
            }))

        )
        /**
         * Need to get stamp count,
         * this can be another query to the STAMP Contract, filtered by these
         * assets, then grouped by asset, which should return all the stamp counts
         * per asset that can then be merged with the stamp list.
         * 
         * This approach should be an optimum way to execute on the server so that
         * compute does not have to be done locally.
         */
        .chain(stamps =>
          Async.fromPromise(query)(STAMP_CONTRACT, ['compose',
            ['mapObjIndexed', ['length']],
            ['groupBy', ['prop', 'asset']],
            ['values'],
            ['prop', 'stamps']
          ])
            .map(counts => {
              return map(s => assoc('count', counts[s.id], s), stamps)
            })

        )

    ))
    .chain(lift)


function toStamp(node) {
  const getTag = (name) => compose(
    propOr('', 'value'),
    find(propEq('name', name))
  )(node.tags)
  const getTopics = () => compose(
    pluck('value'),
    filter(t => /^Topic:/.test(t.name))
  )(node.tags)

  return {
    id: node.id,
    owner: node.owner.address,
    title: getTag('Title') || getTag('Page-Title'),
    description: getTag('Description'),
    type: getTag('Type'),
    topics: getTopics()
  }
}

function buildQuery(assets) {
  return {
    query: `query($cursor: String, $assets: [ID!]) {
    transactions(
      first: 100,
      after: $cursor,
      ids: $assets) {
      pageInfo {
        hasNextPage
      }
      edges {
        cursor
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
  }`,
    variables: {
      assets,
      cursor: ""
    }
  }
}