import useSWRImmutable from 'swr/immutable'

import getAssetParams from 'api/params/getAssetParams'
import useChainConfig from 'hooks/chain/useChainConfig'

export default function useAssetParams() {
  const chainConfig = useChainConfig()
  return useSWRImmutable(
    `chains/${chainConfig.id}/assets/params`,
    () => getAssetParams(chainConfig),
    {
      suspense: true,
    },
  )
}
