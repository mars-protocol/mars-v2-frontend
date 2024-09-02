import useSWR from 'swr'

import getHLSStakingAssets from 'api/hls/getHLSStakingAssets'
import useWhitelistedAssets from 'hooks/assets/useWhitelistedAssets'
import useCampaignApys from 'hooks/campaign/useCampaignApys'
import useChainConfig from 'hooks/chain/useChainConfig'

export default function useHLSStakingAssets() {
  const chainConfig = useChainConfig()
  const assets = useWhitelistedAssets()
  const { data: apys } = useCampaignApys()
  return useSWR(
    `chains/${chainConfig.id}/assets/hls/staking`,
    () => getHLSStakingAssets(chainConfig, assets, apys),
    {
      fallbackData: [],
      revalidateOnFocus: false,
    },
  )
}
