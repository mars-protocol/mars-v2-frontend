import { NAME_META } from 'components/hls/Farm/Table/Columns/Name'
import useDepositedColumns from 'components/hls/Staking/Table/Columns/useDepositedColumns'
import Table from 'components/common/Table'
import useHLSStakingAccounts from 'hooks/hls/useHLSStakingAccounts'
import useStore from 'store'

const title = 'Active Strategies'

export default function ActiveStakingAccounts() {
  const address = useStore((s) => s.address)
  const columns = useDepositedColumns({ isLoading: false })
  const { data: hlsStakingAccounts } = useHLSStakingAccounts(address)

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
