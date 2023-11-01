import { Suspense } from 'react'

import { NAME_META } from 'components/HLS/Farm/Table/Columns/Name'
import useAvailableColumns from 'components/HLS/Staking/Table/Columns/useAvailableColumns'
import Table from 'components/Table'
import useHLSStakingAssets from 'hooks/useHLSStakingAssets'
import { getEnabledMarketAssets } from 'utils/assets'

const title = 'Available HLS Staking'

function Content() {
  const assets = getEnabledMarketAssets()
  const { data: hlsStrategies } = useHLSStakingAssets()
  const columns = useAvailableColumns({ isLoading: false })

  return (
    <Table
      title={title}
      columns={columns}
      data={hlsStrategies}
      initialSorting={[{ id: NAME_META.id, desc: true }]}
    />
  )
}

export default function AvailableHlsVaults() {
  return (
    <Suspense fallback={<Fallback />}>
      <Content />
    </Suspense>
  )
}

function Fallback() {
  const columns = useAvailableColumns({ isLoading: true })

  return (
    <Table
      title={title}
      columns={columns}
      data={[]}
      initialSorting={[{ id: NAME_META.id, desc: true }]}
    />
  )
}
