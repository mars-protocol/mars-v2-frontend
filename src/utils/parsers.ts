import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'

export function isNumber(value: unknown) {
  if (typeof value === 'string' && value !== '') {
    return !isNaN(Number(value))
  }

  return typeof value === 'number'
}

export const convertAprToApy = (apr: number, numberOfCompoundingPeriods: number): number => {
  return ((1 + apr / 100 / numberOfCompoundingPeriods) ** numberOfCompoundingPeriods - 1) * 100
}

export const convertApyToApr = (apy: number, numberOfCompoundingPeriods: number): number => {
  const periodicRate = (1 + apy / 100) ** (1 / numberOfCompoundingPeriods) - 1
  return periodicRate * numberOfCompoundingPeriods * 100
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

  return Object.keys(combinedMap).map(
    (denom) =>
      new BNCoin({
        denom,
        amount: BN(combinedMap[denom]).toString(),
      }),
  )
}
