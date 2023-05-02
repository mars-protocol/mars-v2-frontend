import BigNumber from 'bignumber.js'

export function BN(n: BigNumber.Value) {
  return new BigNumber(n)
}
