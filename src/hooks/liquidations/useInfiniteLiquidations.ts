import getLiquidations from 'api/liquidations/getLiquidations'
import useSWR from 'swr'
import useChainConfig from 'hooks/chain/useChainConfig'
import { useCallback, useState } from 'react'

export default function useInfiniteLiquidations(pageSize = 25, searchQuery?: string | string[]) {
  const chainConfig = useChainConfig()
  const [allData, setAllData] = useState<LiquidationDataItem[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const { data, isLoading, error } = useSWR(
    chainConfig && hasMore
      ? ['liquidations/infiniteData', chainConfig, currentPage, pageSize, searchQuery]
      : null,
    async () => {
      return getLiquidations(chainConfig, currentPage, pageSize, searchQuery)
    },
    {
      onSuccess: (newData) => {
        if (newData && newData.data) {
          setAllData((prev) => [...prev, ...newData.data])

          // Check if there's more data to load
          const totalLoaded = currentPage * pageSize
          if (totalLoaded >= newData.total || newData.data.length < pageSize) {
            setHasMore(false)
          }
        }
      },
    },
  )

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      setCurrentPage((prev) => prev + 1)
    }
  }, [isLoading, hasMore])

  return {
    data: allData,
    isLoading,
    error,
    hasMore,
    loadMore,
  }
}
