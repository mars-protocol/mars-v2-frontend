import { Suspense, useMemo } from 'react'

import { NAME_META } from 'components/HLS/Farm/Table/Columns/Name'
import useAvailableColumns from 'components/HLS/Farm/Table/Columns/useAvailableColumns'
import Table from 'components/Table'
import { ENV } from 'constants/env'
import { BN_ZERO } from 'constants/math'
import { TESTNET_VAULTS_META_DATA, VAULTS_META_DATA } from 'constants/vaults'
import useVaults from 'hooks/useVaults'
import { NETWORK } from 'types/enums/network'

const title = 'Available HLS Vaults'

function Content() {
  const { data: vaults } = useVaults()
  const hlsVaults: Vault[] = useMemo(() => vaults?.filter((vault) => vault.hls) || [], [vaults])
  const columns = useAvailableColumns({ isLoading: false })

  return (
    <Table
      title={title}
      columns={columns}
      data={hlsVaults}
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

  const vaults = ENV.NETWORK === NETWORK.TESTNET ? TESTNET_VAULTS_META_DATA : VAULTS_META_DATA
  const mockVaults: Vault[] = vaults.map((vault) => ({
    ...vault,
    apy: null,
    apr: null,
    ltv: {
      max: 0,
      liq: 0,
    },
    cap: {
      denom: 'denom',
      used: BN_ZERO,
      max: BN_ZERO,
    },
  }))
  return (
    <Table
      title={title}
      columns={columns}
      data={mockVaults}
      initialSorting={[{ id: NAME_META.id, desc: true }]}
    />
  )
}
