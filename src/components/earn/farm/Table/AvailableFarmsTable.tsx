import Table from 'components/common/Table'
import useAvailableFarmsColumns from 'components/earn/farm/Table/Columns/useAvailableFarmsColumns'
import useAvailableFarms from 'hooks/farms/useAvailableFarms'

export default function AvailableFarmsTable() {
  const availableFarms = useAvailableFarms()
  const columns = useAvailableFarmsColumns({ isLoading: false })

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
