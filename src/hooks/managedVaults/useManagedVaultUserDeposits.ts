import useWalletBalances from 'hooks/wallet/useWalletBalances'
import { BN } from 'utils/helpers'

export function useManagedVaultUserDeposits(address: string | undefined, vaultAddress: string) {
  const { data: walletBalances } = useWalletBalances(address)
  const vaultTokenDenom = `factory/${vaultAddress}/vault_ntrn`

  const deposit = walletBalances?.find((balance) => balance.denom === vaultTokenDenom)

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
