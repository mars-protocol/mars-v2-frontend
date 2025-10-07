import useVaultDepositorsColumns from 'components/managedVaults/vaultDetails/overview/DepositorTable/useVaultDepositorsColumns'
import Table from 'components/common/Table'
import useManagedVaultDepositors from 'hooks/managedVaults/useManagedVaultDepositors'
import { CircularProgress } from 'components/common/CircularProgress'
import Text from 'components/common/Text'

interface Props {
  vaultTokensDenom: string
  vaultAddress: string
  baseTokensDenom: string
  vaultTokensAmount: string
  ownerAddress: string
}

export default function VaultDepositorsTable(props: Props) {
  const { vaultTokensDenom, vaultAddress, baseTokensDenom, vaultTokensAmount, ownerAddress } = props
  const managedVaultDepositorsData = useManagedVaultDepositors(vaultTokensDenom)

  const columns = useVaultDepositorsColumns(
    vaultAddress,
    baseTokensDenom,
    vaultTokensAmount,
    ownerAddress,
  )

  if (managedVaultDepositorsData.isLoading) {
    return (
      <div className='flex justify-center items-center h-full w-full'>
        <CircularProgress size={50} />
      </div>
    )
  }

  if ((managedVaultDepositorsData.data || []).length === 0) {
    return (
      <div className='flex justify-center items-center h-full w-full'>
        <Text size='sm' className='text-white/60'>
          This vault has no depositors.
        </Text>
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
