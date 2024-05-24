import getAstroportAssets from 'api/assets/getAstroportAssets'
import useChainConfig from 'hooks/chain/useChainConfig'
import useSWR from 'swr'

export default function useAstroportAssets() {
  const chainConfig = useChainConfig()

  return useSWR(`chains/${chainConfig.id}/astroportAssets`, () => getAstroportAssets(chainConfig), {
    suspense: true,
    revalidateOnFocus: false,
    staleTime: 30_000,
    revalidateIfStale: true,
  })
}
