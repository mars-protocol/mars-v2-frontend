import useSWR from 'swr'

import getHlsStakingAssets from 'api/hls/getHlsStakingAssets'
import useWhitelistedAssets from 'hooks/assets/useWhitelistedAssets'
import useChainConfig from 'hooks/chain/useChainConfig'
import useMarkets from 'hooks/markets/useMarkets'

export default function useHlsStakingAssets() {
  const chainConfig = useChainConfig()
  const assets = useWhitelistedAssets()
  const markets = useMarkets()
  return useSWR(
    `chains/${chainConfig.id}/assets/hls/staking`,
    () => getHlsStakingAssets(chainConfig, assets, markets),
    {
      fallbackData: [],
      revalidateOnFocus: false,
    },
  )
}
