import useSWR from 'swr'

import getPrices from 'api/prices/getPrices'
import useAssetsWithoutPrices from 'hooks/assets/useAssetsWithoutPrices'
import useChainConfig from 'hooks/chain/useChainConfig'

export default function usePrices() {
  const chainConfig = useChainConfig()
  const { data: assets } = useAssetsWithoutPrices()

  return useSWR(assets && `chains/${chainConfig.id}/prices`, () => getPrices(chainConfig, assets), {
    suspense: true,
    revalidateOnFocus: false,
    keepPreviousData: false,
    staleTime: 30_000,
    revalidateIfStale: true,
  })
}
