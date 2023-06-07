import BigNumber from 'bignumber.js'

export function BN(n: BigNumber.Value) {
  return new BigNumber(n)
}

export function getApproximateHourlyInterest(amount: string, borrowRate: number) {
  return BigNumber(borrowRate)
    .div(24 * 365)
    .times(amount)
}
