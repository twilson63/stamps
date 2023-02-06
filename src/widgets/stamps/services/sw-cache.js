import fpjson from "fpjson-lang"

const DRE = 'https://dre-1.warp.cc'

export const query = (contract, q) =>
  fetch(`${DRE}/contract?id=${contract}&query=$`).then(res => res.json())
    .then(r => r.result[0])
    .then(s => fpjson([q, s]))
    .then(x => (console.log(x), x))
