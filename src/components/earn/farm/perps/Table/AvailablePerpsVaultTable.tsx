import Table from 'components/common/Table'
import usePerpsVault from 'hooks/perps/usePerpsVault'
import useAvailablePerpsColumns from './Columns/useAvailablePerpsColumns'

export default function AvailablePerpsVaultsTable() {
  const { data: vault } = usePerpsVault()
  const columns = useAvailablePerpsColumns({ isLoading: false })

  if (!vault) return null

  return (
    <Table
      hideCard
      title='Available vaults'
      columns={columns}
      data={[vault]}
      initialSorting={[{ id: 'name', desc: false }]}
    />
  )
}
