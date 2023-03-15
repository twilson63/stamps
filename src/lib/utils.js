import {
  always, compose, cond, equals, T, takeLast, join, split, identity
} from 'ramda'
import { BigNumber } from 'bignumber.js'

export const barToAtomic = (bar) => BigNumber.clone({ DECIMAL_PLACES: 6 })(bar).shiftedBy(6).toFixed(6)
export const atomicToBar = (atomic) => BigNumber.clone({ DECIMAL_PLACES: 6 })(atomic).shiftedBy(-6).toFixed(6)

export const stampToAtomic = (stamp) => BigNumber.clone({ DECIMAL_PLACES: 12 })(stamp).shiftedBy(12).toFixed(0)
export const atomicToStamp = (atomic) => BigNumber.clone({ DECIMAL_PLACES: 12 })(atomic).shiftedBy(-12).toFixed(12)

export const arToWinston = (stamp) => BigNumber.clone({ DECIMAL_PLACES: 12 })(stamp).shiftedBy(12).toFixed(0)
export const winstonToAr = (atomic) => BigNumber.clone({ DECIMAL_PLACES: 12 })(atomic).shiftedBy(-12).toFixed(12)

export function getHost() {
  return compose(
    cond([
      [equals("gitpod.io"), always("arweave.net")],
      [equals("arweave.dev"), always("arweave.net")],
      [equals("localhost"), always("arweave.net")],
      [T, identity],
    ]),
    join("."),
    takeLast(2),
    split(".")
  )(location.hostname);
}