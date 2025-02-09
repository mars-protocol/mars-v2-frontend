import { getManagedVaultAllUnlocks } from 'api/cosmwasm-client'
import useChainConfig from 'hooks/chain/useChainConfig'
import useSWR from 'swr'
import { useState } from 'react'

export function useAllUnlocks(vaultAddress: string, limit: number = 3) {
  const chainConfig = useChainConfig()

  const [currentPage, setCurrentPage] = useState<number>(1)
  const [allData, setAllData] = useState<UserManagedVaultUnlock[]>([])

  const { data: completeData, isLoading } = useSWR(
    vaultAddress ? `chains/${chainConfig.id}/vaults/${vaultAddress}/allUnlocks/complete` : null,
    async () => {
      try {
        const response = await getManagedVaultAllUnlocks(
          chainConfig,
          vaultAddress!,
          undefined,
          null,
        )
        setAllData(response.data)
        return response
      } catch (error) {
        console.error('Error fetching all unlocks:', error)
        return { data: [], metadata: { has_more: false } }
      }
    },
    {
      revalidateOnFocus: false,
      refreshInterval: 10_000,
    },
  )

  const paginatedData = allData.slice((currentPage - 1) * limit, currentPage * limit)
  const totalPages = Math.ceil(allData.length / limit)

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return
    if (newPage > totalPages) return
    setCurrentPage(newPage)
  }

  return {
    data: paginatedData,
    isLoading,
    currentPage,
    totalPages,
    totalCount: allData.length,
    handlePageChange,
  }
}
