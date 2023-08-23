import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'
export function isNumber(value: unknown) {
  if (typeof value === 'string' && value !== '') {
    return !isNaN(Number(value))
  }

  if (typeof value === 'number') {
    return true
  }

  return false
}

export const convertAprToApy = (apr: number, numberOfCompoundingPeriods: number): number => {
  return ((1 + apr / 100 / numberOfCompoundingPeriods) ** numberOfCompoundingPeriods - 1) * 100
}

export const convertApyToApr = (apy: number, numberOfCompoundingPeriods: number): number => {
  return (
    (Math.pow(1 + apy / 100, numberOfCompoundingPeriods) - 1) * 100 * numberOfCompoundingPeriods
  )
}

export const combineBNCoins = (coins: BNCoin[]): BNCoin[] => {
  const combinedMap: { [key: string]: number } = {}

  coins.forEach((coin) => {
    if (combinedMap.hasOwnProperty(coin.denom)) {
      combinedMap[coin.denom] += coin.amount.toNumber()
    } else {
      combinedMap[coin.denom] = coin.amount.toNumber()
    }
  })

  const combinedArray: BNCoin[] = Object.keys(combinedMap).map(
    (denom) =>
      new BNCoin({
        denom,
        amount: BN(combinedMap[denom]).toString(),
      }),
  )

  return combinedArray
}
