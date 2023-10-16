import useSWR from 'swr'

import getHLSStakingAssets from 'api/hls/getHLSStakingAssets'

export default function useHLSStakingAssets() {
  return useSWR('hls-staking', getHLSStakingAssets, {
    fallbackData: [],
    revalidateOnFocus: false,
  })
}
