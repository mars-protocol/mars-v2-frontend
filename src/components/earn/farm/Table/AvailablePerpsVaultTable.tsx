import React from 'react'

import Table from 'components/common/Table'
import useAvailablePerpsColumns from 'components/earn/farm/Table/Columns/useAvailablePerpsColumns'
import usePerpsVaults from 'hooks/perps/usePerpsVaults'

export default function AvailablePerpsVaultsTable() {
  const { data: vaults } = usePerpsVaults()
  const columns = useAvailablePerpsColumns({ isLoading: false })

  if (!vaults?.length) return null

  return (
    <Table
      hideCard
      title='Available vaults'
      columns={columns}
      data={vaults}
      initialSorting={[{ id: 'name', desc: true }]}
    />
  )
}
