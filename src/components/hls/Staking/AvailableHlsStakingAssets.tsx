import { Suspense } from 'react'

import Table from 'components/common/Table'
import useHlsStakingAssets from 'hooks/hls/useHlsStakingAssets'
import { NAME_META } from './Table/Columns/Name'
import useAvailableColumns from './Table/Columns/useAvailableColumns'

const title = 'Available Strategies'

function Content() {
  const { data: hlsStrategies } = useHlsStakingAssets()
  const columns = useAvailableColumns({ isLoading: false })

  return (
    <Table
      title={title}
      columns={columns}
      data={hlsStrategies}
      initialSorting={[{ id: NAME_META.id, desc: false }]}
    />
  )
}

export default function AvailableHlsStakings() {
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
      initialSorting={[{ id: NAME_META.id, desc: false }]}
    />
  )
}
