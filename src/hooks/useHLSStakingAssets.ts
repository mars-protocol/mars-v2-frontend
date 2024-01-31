import useSWR from 'swr'

import getHLSStakingAssets from 'api/hls/getHLSStakingAssets'
import useChainConfig from 'hooks/useChainConfig'

export default function useHLSStakingAssets() {
  const chainConfig = useChainConfig()
  return useSWR(
    `chains/${chainConfig.id}/assets/hls/staking`,
    () => getHLSStakingAssets(chainConfig),
    {
      fallbackData: [],
      revalidateOnFocus: false,
    },
  )
}
