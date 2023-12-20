import useSWR from 'swr'

import getHLSStakingAssets from 'api/hls/getHLSStakingAssets'
import useChainConfig from 'hooks/useChainConfig'

export default function useHLSStakingAssets() {
  const chainConfig = useChainConfig()
  return useSWR('hls-staking', () => getHLSStakingAssets(chainConfig), {
    fallbackData: [],
    revalidateOnFocus: false,
  })
}
