import { BN } from 'utils/helpers'

export const devideByPotentiallyZero = (numerator: number, denominator: number): number => {
  if (denominator === 0) return 0
  return numerator / denominator
}

export function getLeveragedApy(baseApy: number, borrowRate: number, leverage: number): number {
  return BN(leverage).times(baseApy).minus(BN(leverage).minus(1).times(borrowRate)).toNumber()
}
