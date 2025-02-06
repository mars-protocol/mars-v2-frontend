import Table from 'components/common/Table'
import useOfficialVaultsColumns from 'components/managedVaults/official/table/useOfficialVaultsColumns'
import useManagedVaults from 'hooks/managedVaults/useManagedVaults'

export function AvailableOfficialVaults() {
  // TODO: Implement official vaults data
  const columns = useOfficialVaultsColumns({ isLoading: false })
  const { data } = useManagedVaults()

  return (
    <Table
      title='Available Vaults'
      columns={columns}
      data={data.availableVaults}
      initialSorting={[]}
    />
  )
}
