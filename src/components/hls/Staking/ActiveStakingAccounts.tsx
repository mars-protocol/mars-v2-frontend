import Table from 'components/common/Table'
import useHlsStakingAccounts from 'hooks/hls/useHlsStakingAccounts'
import useStore from 'store'
import { NAME_META } from './Table/Columns/Name'
import useDepositedColumns from './Table/Columns/useDepositedColumns'

const title = 'Active Strategies'

export default function ActiveStakingAccounts() {
  const address = useStore((s) => s.address)
  const columns = useDepositedColumns({ isLoading: false })
  const { data: hlsStakingAccounts } = useHlsStakingAccounts(address)

  if (!hlsStakingAccounts.length) return null

  return (
    <Table
      title={title}
      columns={columns}
      data={hlsStakingAccounts}
      initialSorting={[{ id: NAME_META.id, desc: false }]}
    />
  )
}
