import { BNCoin } from 'types/classes/BNCoin'
import { BN_ZERO } from 'constants/math'
import { BigNumber } from 'bignumber.js'

export function findBalanceForAsset(
  balances: BNCoin[],
  denom: string,
  chainName?: string,
): BigNumber {
  const matchingDenomBalances = balances.filter((coin) => coin.denom === denom)

  if (matchingDenomBalances.length > 1) {
    return (
      matchingDenomBalances.find((coin) =>
        chainName ? coin.chainName === chainName : !coin.chainName,
      )?.amount ?? BN_ZERO
    )
  }

  return matchingDenomBalances[0]?.amount ?? BN_ZERO
}
