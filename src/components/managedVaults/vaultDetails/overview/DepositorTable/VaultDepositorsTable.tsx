import useVaultDepositorsColumns from 'components/managedVaults/vaultDetails/overview/DepositorTable/useVaultDepositorsColumns'
import Table from 'components/common/Table'
import useManagedVaultDepositors from 'hooks/managedVaults/useManagedVaultDepositors'
import { CircularProgress } from 'components/common/CircularProgress'

interface Props {
  vaultTokensDenom: string
  vaultAddress: string
  baseTokensDenom: string
  vault_tokens_amount: string
}

export default function VaultDepositorsTable(props: Props) {
  const { vaultTokensDenom, vaultAddress, baseTokensDenom, vault_tokens_amount } = props
  const managedVaultDepositorsData = useManagedVaultDepositors(vaultTokensDenom)

  const columns = useVaultDepositorsColumns(vaultAddress, baseTokensDenom, vault_tokens_amount)

  if (managedVaultDepositorsData.isLoading) {
    return (
      <div className='flex justify-center items-center h-full w-full'>
        <CircularProgress size={50} />
      </div>
    )
  }

  return (
    <Table
      title='Depositors'
      columns={columns}
      data={managedVaultDepositorsData.data || []}
      tableBodyClassName='text-white/80'
      initialSorting={[{ id: 'percentage', desc: true }]}
      spacingClassName='p-2'
      hideCard
    />
  )
}
