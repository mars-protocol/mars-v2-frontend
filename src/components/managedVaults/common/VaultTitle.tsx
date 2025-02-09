import { useManagedVaultDetails } from 'hooks/managedVaults/useManagedVaultDetails'

interface Props {
  account: Account
}

export default function VaultTitle(props: Props) {
  const { account } = props
  const vaultAddress =
    typeof account.kind === 'object' && 'fund_manager' in account.kind
      ? account.kind.fund_manager.vault_addr
      : ''
  const { details } = useManagedVaultDetails(vaultAddress)

  return (
    <>
      {details?.title
        ? `${details.title} (Vault Account ${account.id})`
        : `Vault Account ${account.id}`}
    </>
  )
}
