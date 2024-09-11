import useSWR from 'swr'

import getHlsStakingAssets from 'api/hls/getHlsStakingAssets'
import useWhitelistedAssets from 'assets/useWhitelistedAssets'
import useChainConfig from 'chain/useChainConfig'

export default function useHlsStakingAssets() {
  const chainConfig = useChainConfig()
  const assets = useWhitelistedAssets()
  return useSWR(
    `chains/${chainConfig.id}/assets/hls/staking`,
    () => getHlsStakingAssets(chainConfig, assets),
    {
      fallbackData: [],
      revalidateOnFocus: false,
    },
  )
}
