import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'

export function isNumber(value: unknown) {
  if (typeof value === 'string' && value !== '') {
    return !isNaN(Number(value))
  }

  return typeof value === 'number'
}

export const convertAprToApy = (apr: number, compoundFrequency: number): number => {
  return ((1 + (apr * 0.01) / compoundFrequency) ** compoundFrequency - 1) * 100
}

export const convertApyToApr = (apy: number, compoundFrequency: number): number => {
  return (((apy / 100 + 1) ** (1 / compoundFrequency) - 1) * compoundFrequency) / 0.01
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
