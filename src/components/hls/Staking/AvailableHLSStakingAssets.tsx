import { Suspense } from 'react'

import { NAME_META } from 'components/hls/Farm/Table/Columns/Name'
import useAvailableColumns from 'components/hls/Staking/Table/Columns/useAvailableColumns'
import Table from 'components/common/Table'
import useHLSStakingAssets from 'hooks/hls/useHLSStakingAssets'

const title = 'Available Strategies'

function Content() {
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
