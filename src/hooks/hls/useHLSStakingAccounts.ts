import useSWR from 'swr'

import getHLSStakingAccounts from 'api/hls/getHLSStakingAccounts'
import useAllAssets from 'hooks/assets/useAllAssets'
import useChainConfig from 'hooks/chain/useChainConfig'

export default function useHLSStakingAccounts(address?: string) {
  const chainConfig = useChainConfig()
  const { data: assets } = useAllAssets()

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
