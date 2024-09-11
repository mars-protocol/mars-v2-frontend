import useSWR from 'swr'

import getHlsFarms from 'api/hls/getHlsFarms'
import useWhitelistedAssets from 'hooks/assets/useWhitelistedAssets'
import useChainConfig from 'hooks/chain/useChainConfig'
import useMarketDepositCaps from 'hooks/markets/useMarketDepositCaps'

export default function useHlsFarms() {
  const chainConfig = useChainConfig()
  const assets = useWhitelistedAssets()
  const { data: depositCaps } = useMarketDepositCaps()
  return useSWR(
    depositCaps && `chains/${chainConfig.id}/assets/hls/farming`,
    () => getHlsFarms(chainConfig, assets, depositCaps!),
    {
      fallbackData: [],
      revalidateOnFocus: false,
    },
  )
}
