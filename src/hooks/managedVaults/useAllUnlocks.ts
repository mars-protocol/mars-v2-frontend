import { getManagedVaultAllUnlocks } from 'api/cosmwasm-client'
import useChainConfig from 'hooks/chain/useChainConfig'
import { useState } from 'react'
import useSWR from 'swr'

export function useAllUnlocks(vaultAddress: string, limit: number = 3) {
  const chainConfig = useChainConfig()

  const [currentPage, setCurrentPage] = useState<number>(1)
  const [startAfter, setStartAfter] = useState<[string, number] | null>(null)

  const { data, error, isLoading } = useSWR(
    vaultAddress
      ? [`chains/${chainConfig.id}/vaults/${vaultAddress}/allUnlocks`, startAfter]
      : null,
    async () => {
      try {
        const response = await getManagedVaultAllUnlocks(
          chainConfig,
          vaultAddress!,
          limit,
          startAfter,
        )
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

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return
    if (!data?.metadata.has_more && newPage > currentPage) return

    if (newPage > currentPage) {
      const lastItem = data?.data[data.data.length - 1]
      setStartAfter(lastItem ? [lastItem.user_address, lastItem.created_at] : null)
    } else if (newPage < currentPage) {
      setStartAfter(null)
    }

    setCurrentPage(newPage)
  }

  return {
    data: data?.data || [],
    isLoading,
    error,
    currentPage,
    totalPages: data?.metadata.has_more ? currentPage + 1 : currentPage,
    handlePageChange,
  }
}
