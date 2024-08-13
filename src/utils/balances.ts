import { BNCoin } from 'types/classes/BNCoin'
import { BN_ZERO } from 'constants/math'
import { BigNumber } from 'bignumber.js'
import { WrappedBNCoin } from 'types/classes/WrappedBNCoin'

export function findBalanceForAsset(
  balances: WrappedBNCoin[],
  denom: string,
  chainName?: string,
): BigNumber {
  const matchingDenomBalances = balances.filter((wrappedCoin) => wrappedCoin.coin.denom === denom)

  if (matchingDenomBalances.length > 1) {
    return (
      matchingDenomBalances.find((wrappedCoin) =>
        chainName ? wrappedCoin.chain === chainName : !wrappedCoin.chain,
      )?.coin.amount ?? BN_ZERO
    )
  }

  return matchingDenomBalances[0]?.coin.amount ?? BN_ZERO
}
