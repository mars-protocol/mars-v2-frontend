import useSWR from 'swr'

import getHLSVaults from 'api/hls/getHLSVaults'
import useChainConfig from 'hooks/useChainConfig'

export default function useHLSVaults() {
  const chainConfig = useChainConfig()
  return useSWR('hls-vaults', () => getHLSVaults(chainConfig), {
    fallbackData: [],
    revalidateOnFocus: false,
  })
}
