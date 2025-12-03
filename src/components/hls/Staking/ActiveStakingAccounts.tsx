import Table from 'components/common/Table'
import { NAME_META } from 'components/hls/Staking/Table/Columns/Name'
import useDepositedColumns from 'components/hls/Staking/Table/Columns/useDepositedColumns'
import useHlsStakingAccounts from 'hooks/hls/useHlsStakingAccounts'
import useStore from 'store'

const title = 'Active High Leverage Staking'

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
