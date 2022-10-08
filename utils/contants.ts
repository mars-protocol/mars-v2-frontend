import { chain } from 'utils/chains'

// StdFee
// TODO: decide some strategy to handle fees
export const hardcodedFee = {
  amount: [
    {
      denom: chain.stakeCurrency.coinMinimalDenom,
      amount: '100000',
    },
  ],
  gas: '1500000',
}
