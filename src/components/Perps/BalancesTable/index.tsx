import usePerpsBalancesColumns from 'components/Perps/BalancesTable/Columns/usePerpsBalancesColumns'
import usePerpsBalancesData from 'components/Perps/BalancesTable/usePerpsBalancesData'
import Table from 'components/Table'

export default function PerpsBalancesTable() {
  const data = usePerpsBalancesData()
  const columns = usePerpsBalancesColumns()

  return <Table title='Perp Positions' columns={columns} data={data} initialSorting={[]} />
}
