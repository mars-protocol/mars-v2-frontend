import useWalletBalances from 'hooks/wallet/useWalletBalances'
import { BN } from 'utils/helpers'
import { useMemo } from 'react'

export function useManagedVaultDeposits(
  address: string | undefined,
  vaults: { vault_token: string; vault_address: string }[],
) {
  const { data: walletBalances } = useWalletBalances(address)

  return useMemo(() => {
    if (!address || !walletBalances || !vaults.length) {
      return new Map<string, boolean>()
    }

    const vaultsByToken = new Map(vaults.map((vault) => [vault.vault_token, vault]))
    const depositMap = new Map<string, boolean>()

    walletBalances.forEach((balance) => {
      if (vaultsByToken.has(balance.denom)) {
        depositMap.set(balance.denom, BN(balance.amount).isGreaterThan(0))
      }
    })

    return depositMap
  }, [address, walletBalances, vaults])
}
