import useSWR from 'swr'

import getHLSStakingAssets from 'api/hls/getHLSStakingAssets'
import useAllAssets from 'hooks/assets/useAllAssets'
import useChainConfig from 'hooks/chain/useChainConfig'

export default function useHLSStakingAssets() {
  const chainConfig = useChainConfig()
  const { data: assets } = useAllAssets()
  return useSWR(
    `chains/${chainConfig.id}/assets/hls/staking`,
    () => getHLSStakingAssets(chainConfig, assets),
    {
      fallbackData: [],
      revalidateOnFocus: false,
    },
  )
}
