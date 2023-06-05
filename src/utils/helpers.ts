import BigNumber from 'bignumber.js'

BigNumber.config({ EXPONENTIAL_AT: 1e9 })
export function BN(n: BigNumber.Value) {
  return new BigNumber(n)
}
