import { useMemo } from 'react'

import { CircularProgress } from 'components/common/CircularProgress'
import Table from 'components/common/Table'
import useAvailableColumns from 'components/earn/farm/common/Table/Columns/useAvailableColumns'
import useAvailableVaults from 'hooks/vaults/useAvailableVaults'
import useVaultAprs from 'hooks/vaults/useVaultAprs'

export default function AvailableVaultsTable() {
  const { data: availableVaultsWithoutApr, isLoading: isAvailableVaultsLoading } =
    useAvailableVaults()
  const { data: vaultAprs, isLoading: isVaultAprsLoading } = useVaultAprs()

  const isLoading = isAvailableVaultsLoading || isVaultAprsLoading
  const columns = useAvailableColumns({ isLoading })

  const availableVaults = useMemo(() => {
    if (!availableVaultsWithoutApr || !vaultAprs) return []
    return availableVaultsWithoutApr.map((vault) => {
      const apr = vaultAprs.find((vaultApr) => vaultApr.address === vault.address)!
      return { ...vault, ...apr }
    })
  }, [availableVaultsWithoutApr, vaultAprs])

  if (isLoading) {
    return (
      <div className='flex justify-center w-full mt-10'>
        <CircularProgress size={50} />
      </div>
    )
  }

  return (
    <Table
      hideCard
      title='Available vaults'
      columns={columns}
      data={availableVaults}
      initialSorting={[{ id: 'name', desc: false }]}
    />
  )
}
