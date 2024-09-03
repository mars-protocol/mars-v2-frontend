import useAvailableVaultsColumns from 'components/vaults/common/table/useAvailableVaultsColumns'
import Table from 'components/common/Table'

interface Props {
  data: Vaults[]
}

export function AvailableVaults(props: Props) {
  const { data } = props
  const columns = useAvailableVaultsColumns({ isLoading: false })

  return <Table title={'Available Vaults'} columns={columns} data={data} initialSorting={[]} />
}
