import useSWR from 'swr'

import getHLSStakingAccounts from 'api/hls/getHLSStakingAccounts'
import useChainConfig from 'hooks/useChainConfig'

export default function useHLSStakingAccounts(address?: string) {
  const chainConfig = useChainConfig()

  return useSWR(
    `${address}/hlsStakingAccounts`,
    () => getHLSStakingAccounts(chainConfig, address),
    {
      fallbackData: [],
      suspense: true,
      revalidateOnFocus: false,
    },
  )
}
