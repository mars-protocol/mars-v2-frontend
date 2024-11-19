import Table from 'components/common/Table'
import useOfficialVaultsColumns from 'components/vaults/official/table/useOfficialVaultsColumns'
import { vaultsOfficialDummyData } from 'components/vaults/dummyData'

export function AvailableOfficialVaults() {
  // TODO: Implement data and isLoading
  const columns = useOfficialVaultsColumns({ isLoading: false })

  return (
    <Table
      title='Available Vaults'
      columns={columns}
      data={vaultsOfficialDummyData}
      initialSorting={[]}
    />
  )
}