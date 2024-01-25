import usePerpsBalancesColumns from 'components/perps/BalancesTable/Columns/usePerpsBalancesColumns'
import usePerpsBalancesData from 'components/perps/BalancesTable/usePerpsBalancesData'
import Table from 'components/common/Table'

export default function PerpsBalancesTable() {
  const data = usePerpsBalancesData()
  const columns = usePerpsBalancesColumns()

  return <Table title='Perp Positions' columns={columns} data={data} initialSorting={[]} />
}
