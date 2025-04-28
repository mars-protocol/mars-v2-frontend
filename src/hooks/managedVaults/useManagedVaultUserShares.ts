import useWalletBalances from 'hooks/wallet/useWalletBalances'
import { BN } from 'utils/helpers'
import { BN_ZERO } from 'constants/math'
import { useMemo } from 'react'

export function useManagedVaultUserShares(address: string | undefined, tokenDenom: string) {
  const { data: walletBalances } = useWalletBalances(address)

  return useMemo(() => {
    const deposit = walletBalances?.find((balance) => balance.denom === tokenDenom)
    const availableAmount = deposit ? BN(deposit.amount) : BN_ZERO
    const calculateVaultShare = (totalVaultTokens: string): number => {
      if (!availableAmount || !totalVaultTokens || BN(totalVaultTokens).isZero()) {
        return 0
      }
      return availableAmount.multipliedBy(100).dividedBy(totalVaultTokens).toNumber()
    }

    return {
      amount: availableAmount.toString(),
      calculateVaultShare,
    }
  }, [walletBalances, tokenDenom])
}
