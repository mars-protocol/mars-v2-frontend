import useSWR from 'swr'

import getAssetParams from 'api/params/getAssetParams'
import useChainConfig from 'hooks/useChainConfig'

export default function useAssetParams() {
  const chainConfig = useChainConfig()
  return useSWR('assetParams', () => getAssetParams(chainConfig), {
    fallbackData: [],
    revalidateOnFocus: false,
  })
}
