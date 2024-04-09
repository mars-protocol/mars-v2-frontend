import BigNumber from 'bignumber.js'
import throttle from 'lodash.throttle'

import { BN_ZERO } from 'constants/math'
import { BNCoin } from 'types/classes/BNCoin'
import { DocURL } from 'types/enums/docURL'
import { WalletID } from 'types/enums/wallet'
import { getCoinValue } from 'utils/formatters'

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

export function getValueFromBNCoins(coins: BNCoin[], prices: BNCoin[], assets: Asset[]): BigNumber {
  let totalValue = BN_ZERO

  coins.forEach((coin) => {
    totalValue = totalValue.plus(getCoinValue(coin, prices, assets))
  })

  return totalValue
}

export function getLeverageFromLTV(ltv: number) {
  return +(1 / (1 - ltv)).toPrecision(2)
}

export function getGovernanceUrl(walletId: WalletID) {
  switch (walletId) {
    case WalletID.Station:
      return DocURL.COUNCIL_STATION
    case WalletID.Leap:
      return DocURL.COUNCIL_LEAP
    default:
      return DocURL.COUNCIL_KEPLR
  }
}

export function capitalizeFirstLetter(string: string) {
  const firstLetter = string.charAt(0).toUpperCase()
  return `${firstLetter}${string.slice(1)}`
}
