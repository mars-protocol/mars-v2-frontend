import useSWR from 'swr'

import getHlsStakingAccounts from 'api/hls/getHlsStakingAccounts'
import useWhitelistedAssets from 'assets/useWhitelistedAssets'
import useChainConfig from 'chain/useChainConfig'

export default function useHlsStakingAccounts(address?: string) {
  const chainConfig = useChainConfig()
  const assets = useWhitelistedAssets()

  return useSWR(
    `${address}/hlsStakingAccounts`,
    () => getHlsStakingAccounts(chainConfig, assets, address),
    {
      fallbackData: [],
      suspense: true,
      revalidateOnFocus: false,
    },
  )
}
