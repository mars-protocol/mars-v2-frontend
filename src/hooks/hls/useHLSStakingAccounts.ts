import useSWR from 'swr'

import getHLSStakingAccounts from 'api/hls/getHLSStakingAccounts'
import useWhitelistedAssets from 'hooks/assets/useWhitelistedAssets'
import useCampaignApys from 'hooks/campaign/useCampaignApys'
import useChainConfig from 'hooks/chain/useChainConfig'

export default function useHLSStakingAccounts(address?: string) {
  const chainConfig = useChainConfig()
  const assets = useWhitelistedAssets()
  const { data: apys } = useCampaignApys()

  return useSWR(
    `${address}/hlsStakingAccounts`,
    () => getHLSStakingAccounts(chainConfig, assets, apys, address),
    {
      fallbackData: [],
      suspense: true,
      revalidateOnFocus: false,
    },
  )
}
