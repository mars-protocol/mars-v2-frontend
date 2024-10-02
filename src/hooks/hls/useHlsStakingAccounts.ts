import useSWR from 'swr'

import getHlsStakingAccounts from 'api/hls/getHlsStakingAccounts'
import useWhitelistedAssets from 'hooks/assets/useWhitelistedAssets'
import useChainConfig from 'hooks/chain/useChainConfig'
import useMarkets from 'hooks/markets/useMarkets'

export default function useHlsStakingAccounts(address?: string) {
  const chainConfig = useChainConfig()
  const assets = useWhitelistedAssets()
  const markets = useMarkets()

  return useSWR(
    `${address}/hlsStakingAccounts`,
    () => getHlsStakingAccounts(chainConfig, assets, markets, address),
    {
      fallbackData: [],
      suspense: true,
      revalidateOnFocus: true,
    },
  )
}
