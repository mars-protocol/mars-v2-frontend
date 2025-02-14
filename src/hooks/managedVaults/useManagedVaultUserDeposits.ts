import { useMemo } from 'react'
import useWalletBalances from 'hooks/wallet/useWalletBalances'

interface VaultDeposit {
  vaultAddress: string
  amount: string
  denom: string
  percentage?: number
}

export function useManagedVaultUserDeposits(address?: string) {
  const { data: walletBalances } = useWalletBalances(address)

  console.log(walletBalances, 'walletBalances')
  const vaultDeposits = useMemo(() => {
    if (!walletBalances || !Array.isArray(walletBalances)) return []

    return walletBalances.reduce<VaultDeposit[]>((result, balance) => {
      if (!balance.denom.includes('vault_')) return result

      const vaultAddress = balance.denom.split('/')[1]
      if (!vaultAddress) return result

      result.push({
        vaultAddress,
        amount: balance.amount,
        denom: balance.denom,
      })

      return result
    }, [])
  }, [walletBalances])

  const getVaultDeposit = (vaultAddress: string): VaultDeposit | undefined => {
    return vaultDeposits.find((deposit) => deposit.vaultAddress === vaultAddress)
  }

  return {
    vaultDeposits,
    getVaultDeposit,
  }
}
