import useWalletBalances from 'hooks/wallet/useWalletBalances'
import { BN } from 'utils/helpers'

export function useManagedVaultUserShares(address: string | undefined, tokenDenom: string) {
  const { data: walletBalances } = useWalletBalances(address)
  const deposit = walletBalances?.find((balance) => balance.denom === tokenDenom)

  const calculateVaultShare = (totalVaultTokens: string): number => {
    if (!deposit?.amount || !totalVaultTokens || BN(totalVaultTokens).isZero()) {
      return 0
    }
    return BN(deposit.amount).multipliedBy(100).dividedBy(totalVaultTokens).toNumber()
  }

  return {
    amount: deposit?.amount || '0',
    calculateVaultShare,
  }
}
