import BigNumber from 'bignumber.js'
import throttle from 'lodash.throttle'

import { BN_ZERO } from 'constants/math'
import { BNCoin } from 'types/classes/BNCoin'
import { getCoinValue } from './formatters'

BigNumber.config({ EXPONENTIAL_AT: 1e9 })

export function BN(n: BigNumber.Value) {
  return new BigNumber(n)
}

export function getApproximateHourlyInterest(amount: string, borrowRate: number) {
  return BigNumber(borrowRate)
    .dividedBy(24 * 365)
    .multipliedBy(amount)
}

export function asyncThrottle<F extends (...args: any[]) => Promise<any>>(func: F, wait?: number) {
  const throttled = throttle((resolve, reject, args: Parameters<F>) => {
    func(...args)
      .then(resolve)
      .catch(reject)
  }, wait)
  return (...args: Parameters<F>): ReturnType<F> =>
    new Promise((resolve, reject) => {
      throttled(resolve, reject, args)
    }) as ReturnType<F>
}

export function mergeBNCoinArrays(array1: BNCoin[], array2: BNCoin[]) {
  const merged: BNCoin[] = []

  array1.forEach((coin) => {
    merged.push(new BNCoin(coin.toCoin()))
  })

  array2.forEach((coin) => {
    const index = merged.findIndex((i) => i.denom === coin.denom)
    if (index === -1) {
      merged.push(new BNCoin(coin.toCoin()))
    } else {
      merged[index].amount = merged[index].amount.plus(coin.amount)
    }
  })
  return merged
}

export function getValueFromBNCoins(coins: BNCoin[], assets: Asset[]): BigNumber {
  let totalValue = BN_ZERO

  coins.forEach((coin) => {
    totalValue = totalValue.plus(getCoinValue(coin, assets))
  })

  return totalValue
}

export function getBNCoinFromValue(value: BigNumber, asset: Asset): BNCoin {
  if (!asset.price) return new BNCoin({ denom: asset.denom, amount: '0' })
  return BNCoin.fromDenomAndBigNumber(
    asset.denom,
    value.dividedBy(asset.price.amount).shiftedBy(asset.decimals),
  )
}

export function getLeverageFromLTV(ltv: number) {
  return +(1 / (1 - ltv)).toPrecision(2)
}
