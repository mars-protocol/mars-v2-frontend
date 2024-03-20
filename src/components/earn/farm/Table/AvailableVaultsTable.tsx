import React, { useMemo } from 'react'

import Table from 'components/common/Table'
import useAvailableColumns from 'components/earn/farm/Table/Columns/useAvailableColumns'
import useAvailableVaults from 'hooks/vaults/useAvailableVaults'
import useVaultAprs from 'hooks/vaults/useVaultAprs'

export default function AvailableVaultsTable() {
  const availableVaultsWithoutApr = useAvailableVaults()
  const { data: vaultAprs } = useVaultAprs()
  const columns = useAvailableColumns({ isLoading: false })

  const availableVaults = useMemo(() => {
    return availableVaultsWithoutApr.map((vault) => {
      const apr = vaultAprs.find((vaultApr) => vaultApr.address === vault.address)!
      return { ...vault, ...apr }
    })
  }, [availableVaultsWithoutApr, vaultAprs])

  return (
    <Table
      hideCard
      title='Available vaults'
      columns={columns}
      data={availableVaults}
      initialSorting={[{ id: 'name', desc: true }]}
    />
  )
}
