import { getManagedVaultAllUnlocks } from 'api/cosmwasm-client'
import useChainConfig from 'hooks/chain/useChainConfig'
import useSWR from 'swr'
import { useState } from 'react'

export function useAllUnlocks(vaultAddress: string, limit: number = 3) {
  const chainConfig = useChainConfig()

  const [currentPage, setCurrentPage] = useState<number>(1)
  const [startAfterByPage, setStartAfterByPage] = useState<Record<number, [string, number] | null>>(
    {
      1: null,
    },
  )

  const { data, error, isLoading } = useSWR(
    vaultAddress
      ? [
          `chains/${chainConfig.id}/vaults/${vaultAddress}/allUnlocks`,
          currentPage,
          startAfterByPage[currentPage],
        ]
      : null,
    async () => {
      try {
        const response = await getManagedVaultAllUnlocks(
          chainConfig,
          vaultAddress!,
          limit,
          startAfterByPage[currentPage],
        )

        if (response.metadata.has_more && response.data.length > 0) {
          const lastItem = response.data[response.data.length - 1]
          setStartAfterByPage((prev) => ({
            ...prev,
            [currentPage + 1]: [lastItem.user_address, lastItem.created_at],
          }))
        }

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
