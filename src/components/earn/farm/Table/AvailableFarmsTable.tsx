import Table from 'components/common/Table'
import useAvailableColumns from 'components/earn/farm/Table/Columns/useAvailableColumns'
import useAvailableFarms from 'hooks/vaults/useAvailableFarms'
import useVaultAprs from 'hooks/vaults/useVaultAprs'

export default function AvailableFarmsTable() {
  const availableFarms = useAvailableFarms()
  const columns = useAvailableColumns({ isLoading: false })

  return (
    <Table
      hideCard
      title='Available LP Farms'
      columns={columns}
      data={availableFarms}
      initialSorting={[{ id: 'name', desc: true }]}
    />
  )
}
