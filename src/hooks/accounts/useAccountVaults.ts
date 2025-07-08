import useAccounts from 'hooks/accounts/useAccounts'

export default function useAccountVaults(address?: string) {
  const { data: vaultAccounts, isLoading } = useAccounts('fund_manager', address)

  return {
    hasVaults: !!vaultAccounts && vaultAccounts.length > 0,
    vaultAccounts,
    isLoading,
  }
}
