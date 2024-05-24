import useSWR from 'swr'

import getAssetParams from 'api/params/getAssetParams'
import useChainConfig from 'hooks/chain/useChainConfig'

export default function useAssetParams() {
  const chainConfig = useChainConfig()
  return useSWR(`chains/${chainConfig.id}/assets/params`, () => getAssetParams(chainConfig), {
    suspense: true,
    revalidateOnFocus: false,
    staleTime: 60_000,
    revalidateIfStale: true,
  })
}
