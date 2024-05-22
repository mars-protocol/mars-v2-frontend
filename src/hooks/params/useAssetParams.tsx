import useSWR from 'swr'

import getAssetParams from 'api/params/getAssetParams'
import useChainConfig from 'hooks/chain/useChainConfig'

export default function useAssetParams() {
  const chainConfig = useChainConfig()
  return useSWR(`chains/${chainConfig.id}/assets/params`, () => getAssetParams(chainConfig), {
    fallbackData: [],
    refreshInterval: 30_000,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
  })
}
