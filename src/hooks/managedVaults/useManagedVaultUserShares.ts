import useWalletBalances from 'hooks/wallet/useWalletBalances'
import { BN } from 'utils/helpers'
import { useUserUnlocks } from 'hooks/managedVaults/useUserUnlocks'
import { BN_ZERO } from 'constants/math'

export function useManagedVaultUserShares(
  address: string | undefined,
  tokenDenom: string,
  vaultAddress: string,
) {
  const { data: walletBalances } = useWalletBalances(address)
  const { data: userUnlocks = [] } = useUserUnlocks(vaultAddress)
  const deposit = walletBalances?.find((balance) => balance.denom === tokenDenom)

  const totalUnlockedAmount = userUnlocks.reduce((total, unlock) => {
    return total.plus(BN(unlock.vault_tokens_amount))
  }, BN_ZERO)

  const availableDeposits = deposit ? BN(deposit.amount).minus(totalUnlockedAmount) : BN_ZERO

  const calculateVaultShare = (totalVaultTokens: string): number => {
    if (!availableDeposits || !totalVaultTokens || BN(totalVaultTokens).isZero()) {
      return 0
    }
    return availableDeposits.multipliedBy(100).dividedBy(totalVaultTokens).toNumber()
  }

  return {
    amount: availableDeposits.toString(),
    calculateVaultShare,
  }
}
