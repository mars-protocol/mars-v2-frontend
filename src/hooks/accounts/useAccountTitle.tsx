import { useManagedVaultDetails } from 'hooks/managedVaults/useManagedVaultDetails'
import { useMemo } from 'react'
import { checkAccountKind } from 'utils/accounts'

export default function useAccountTitle(
  account: Account | undefined,
  hideVaultId: boolean = false,
) {
  const isVault = checkAccountKind(account?.kind ?? 'default') === 'fund_manager'
  const vaultAddress =
    account && typeof account.kind === 'object' && 'fund_manager' in account.kind
      ? account.kind.fund_manager.vault_addr
      : undefined
  const { details } = useManagedVaultDetails(vaultAddress)

  return useMemo(() => {
    if (!account) return `Select Account`
    if (!isVault) return `Credit Account ${account.id}`
    if (details?.title) {
      if (hideVaultId) return details.title
      return `${details.title} (Vault Account ${account.id})`
    }

    return `Vault Account ${account.id}`
  }, [account, details?.title, hideVaultId, isVault])
}
