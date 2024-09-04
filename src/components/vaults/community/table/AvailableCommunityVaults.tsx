import Table from 'components/common/Table'
import useCommunityVaultsColumns from 'components/vaults/community/table/useCommunityVaultsColumns'
import { vaultsCommunityDummyData } from 'components/vaults/dummyData'

export function AvailableCommunityVaults() {
  const columns = useCommunityVaultsColumns({ isLoading: false })

  return (
    <Table
      title='Available Vaults'
      columns={columns}
      data={vaultsCommunityDummyData}
      initialSorting={[]}
    />
  )
}
