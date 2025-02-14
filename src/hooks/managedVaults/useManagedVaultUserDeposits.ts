import { useMemo } from 'react'
import useWalletBalances from 'hooks/wallet/useWalletBalances'
import { BN } from 'utils/helpers'

interface VaultDeposit {
  vaultAddress: string
  amount: string
  denom: string
}

export function useManagedVaultUserDeposits(address?: string) {
  const { data: walletBalances } = useWalletBalances(address)

  const vaultDeposits = useMemo(() => {
    if (!address || !walletBalances || !Array.isArray(walletBalances)) return []

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
  }, [address, walletBalances])

  const getVaultDeposit = (vaultAddress: string): VaultDeposit | undefined => {
    if (!address) return undefined
    return vaultDeposits.find((deposit) => deposit.vaultAddress === vaultAddress)
  }

  const calculateVaultShare = (vaultAddress: string, totalVaultTokens: string): number => {
    if (!address) return 0
    const deposit = getVaultDeposit(vaultAddress)
    if (!deposit || !totalVaultTokens || BN(totalVaultTokens).isZero()) {
      return 0
    }

    return BN(deposit.amount).multipliedBy(100).dividedBy(totalVaultTokens).toNumber()
  }

  return {
    vaultDeposits,
    getVaultDeposit,
    calculateVaultShare,
  }
}
