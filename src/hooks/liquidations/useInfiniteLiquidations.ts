import getLiquidations from 'api/liquidations/getLiquidations'
import useChainConfig from 'hooks/chain/useChainConfig'
import useSWRInfinite from 'swr/infinite'

export default function useInfiniteLiquidations(pageSize = 25, searchQuery?: string | string[]) {
  const chainConfig = useChainConfig()

  const getKey = (pageIndex: number, previousPageData: LiquidationsResponse | null) => {
    if (previousPageData && (!previousPageData.data || previousPageData.data.length === 0)) {
      return null
    }

    return chainConfig ? ['liquidations', chainConfig, pageIndex + 1, pageSize, searchQuery] : null
  }

  const { data, size, setSize, isLoading, isValidating } = useSWRInfinite(
    getKey,
    ([, , page, pageSize, searchQuery]) =>
      getLiquidations(
        chainConfig,
        Number(page),
        Number(pageSize),
        searchQuery as string | string[],
      ),
  )

  // Flatten all pages into single array
  const liquidations = data?.flatMap((page) => page.data) ?? []

  const totalLoaded = liquidations.length
  const totalAvailable = data?.[0]?.total ?? 0
  const hasMore = totalLoaded < totalAvailable

  const loadMore = () => {
    if (!isValidating && hasMore) {
      setSize(size + 1)
    }
  }

  return {
    data: liquidations,
    isLoading,
    hasMore,
    loadMore,
    isValidating,
  }
}
