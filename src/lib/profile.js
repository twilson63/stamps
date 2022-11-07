import { pathOr, prop, propEq } from 'ramda'

const empty = {}

/**
 * @param {any} arweave
 * @param {string[]} addresses
 */
export async function getProfile(arweave, addresses) {
  return arweave.api.post('graphql', { query: buildPermapageProfileQuery(addresses) })
    .then(pathOr(null, ['data', 'data', 'transactions', 'edges', '0', 'node']))
    .then(node => node ? ({
      txid: node.id,
      addr: node.owner.address,
      profile: {
        handleName: prop('value', node.tags.find(propEq('name', 'Profile-Name'))),
        avatarURL: prop('value', node.tags.find(propEq('name', 'Profile-Avatar')))
      }
    }) : empty)

}


function buildPermapageProfileQuery(addresses) {
  return `query {
    transactions(
      first: 1,
      owners: [${addresses.map(x => `"${x}"`).join(',')}],
      tags: [
        { name: "Protocol", values: ["PermaProfile-v0.1"]}
      ]
    ) {
      edges {
        node {
          id
          owner {
            address
          },
          tags {
            name
            value
          }
        }
      }
    }
  }`
}

function buildArProfileQuery(addresses) {
  return `query {
    transactions(
        owners: [${addresses.map(x => `"${x}"`).join(',')}],
        tags: [
          { name: "Protocol-Name", values: ["Account-0.2"]}
        ]
      ) {
        edges {
          node {
            id
            owner {
              address
            },
            tags {
              name
              value
            }
          }
        }
      }
    }`
}