import { NAME_META } from 'components/HLS/Farm/Table/Columns/Name'
import useDepositedColumns from 'components/HLS/Staking/Table/Columns/useDepositedColumns'
import Table from 'components/Table'
import useHLSStakingAccounts from 'hooks/useHLSStakingAccounts'
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
      initialSorting={[{ id: NAME_META.id, desc: true }]}
    />
  )
}
