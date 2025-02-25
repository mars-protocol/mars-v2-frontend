import { getManagedVaultAllUnlocks } from 'api/cosmwasm-client'
import useChainConfig from 'hooks/chain/useChainConfig'
import useSWR from 'swr'
import { useState } from 'react'

export function useAllUnlocks(vaultAddress: string, itemsPerPage: number = 3) {
  const chainConfig = useChainConfig()

  const [currentPage, setCurrentPage] = useState<number>(1)

  const { data = [], isLoading } = useSWR<UserManagedVaultUnlock[]>(
    vaultAddress ? `chains/${chainConfig.id}/vaults/${vaultAddress}/allUnlocks/complete` : null,
    async () => {
      try {
        const response = await getManagedVaultAllUnlocks(
          chainConfig,
          vaultAddress!,
          undefined,
          null,
        )
        return response.data
      } catch (error) {
        console.error('Error fetching all unlocks:', error)
        return []
      }
    },
    {
      revalidateOnFocus: false,
      refreshInterval: 10_000,
    },
  )

  const paginatedData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const totalPages = Math.ceil(data.length / itemsPerPage)

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return
    if (newPage > totalPages) return
    setCurrentPage(newPage)
  }

  return {
    data: paginatedData,
    allData: data,
    isLoading,
    currentPage,
    totalPages,
    totalCount: data.length,
    handlePageChange,
  }
}
