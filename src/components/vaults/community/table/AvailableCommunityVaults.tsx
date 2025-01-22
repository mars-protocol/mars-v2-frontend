import Table from 'components/common/Table'
import useCommunityVaultsColumns from 'components/vaults/community/table/useCommunityVaultsColumns'
import useManagedVaults from 'hooks/managedVaults/useManagedVaults'

export function AvailableCommunityVaults() {
  const { data: managedVaults, isLoading } = useManagedVaults()

  console.log('managedVaults', managedVaults)
  const columns = useCommunityVaultsColumns({ isLoading })

  return (
    <Table
      title='Available Vaults'
      columns={columns}
      data={managedVaults.data}
      initialSorting={[]}
    />
  )
}
