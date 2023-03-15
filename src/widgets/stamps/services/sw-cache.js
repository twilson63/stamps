import fpjson from "fpjson-lang"

const CACHE = 'https://cache-2.permaweb.tools'

export const query = (contract, q) =>
  fetch(`${CACHE}/contract?id=${contract}`).then(res => res.json())
    .then(r => r.state)
    .then(s => fpjson([q, s]))
    .then(x => (console.log(x), x))
