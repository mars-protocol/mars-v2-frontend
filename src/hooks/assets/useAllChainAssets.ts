import getChainAssets from 'api/assets/getChainAssets'
import useChainConfig from 'hooks/chain/useChainConfig'
import useSWR from 'swr'

export default function useAllChainAssets() {
  const chainConfig = useChainConfig()
  return useSWR(
    chainConfig.anyAsset && `chains/${chainConfig.id}/allChainAssets`,
    () => getChainAssets(chainConfig),
    {
      fallbackData: chainConfig.assets,
      refreshInterval: 30_000,
      revalidateOnFocus: false,
      keepPreviousData: false,
    },
  )
}
