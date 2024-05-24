import useSWR from 'swr'

import getPrices from 'api/prices/getPrices'
import useAstroportAssets from 'hooks/assets/useAstroportAssets'
import useChainConfig from 'hooks/chain/useChainConfig'

export default function usePrices() {
  const chainConfig = useChainConfig()
  const { data: assets } = useAstroportAssets()

  return useSWR(assets && `chains/${chainConfig.id}/prices`, () => getPrices(chainConfig, assets), {
    suspense: true,
    revalidateOnFocus: false,
    keepPreviousData: false,
    staleTime: 30_000,
    revalidateIfStale: true,
  })
}
