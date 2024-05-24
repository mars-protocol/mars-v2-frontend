import useSWR from 'swr'

import getHLSStakingAccounts from 'api/hls/getHLSStakingAccounts'
import useAssets from 'hooks/assets/useAssets'
import useChainConfig from 'hooks/chain/useChainConfig'

export default function useHLSStakingAccounts(address?: string) {
  const chainConfig = useChainConfig()
  const { data: assets } = useAssets()

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
