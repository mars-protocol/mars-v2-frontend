import Table from 'components/common/Table'
import useAvailablePerpsColumns from 'components/earn/farm/perps/Table/Columns/useAvailablePerpsColumns'
import usePerpsVault from 'hooks/perps/usePerpsVault'

export default function AvailablePerpsVaultsTable() {
  const { data: vault } = usePerpsVault()
  const columns = useAvailablePerpsColumns({ isLoading: false })

  if (!vault) return null

  return (
    <Table
      title='Available Vaults'
      columns={columns}
      data={[vault]}
      initialSorting={[{ id: 'name', desc: false }]}
    />
  )
}
