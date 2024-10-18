import useSWR from 'swr'

import getHLSStakingAccounts from 'api/hls/getHLSStakingAccounts'
import useWhitelistedAssets from 'hooks/assets/useWhitelistedAssets'
import useChainConfig from 'hooks/chain/useChainConfig'

export default function useHLSStakingAccounts(address?: string) {
  const chainConfig = useChainConfig()
  const assets = useWhitelistedAssets()

  return useSWR(
    `${address}/hlsStakingAccounts`,
    () => getHLSStakingAccounts(chainConfig, assets, address),
    {
      fallbackData: [],
      suspense: true,
      revalidateOnFocus: false,
    },
  )
}
