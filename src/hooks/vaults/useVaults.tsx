import useSWR from 'swr'

import getVaults from 'api/vaults/getVaults'
import useChainConfig from 'chain/useChainConfig'

export default function useVaults(suspense = true, address?: string) {
  const chainConfig = useChainConfig()

  return useSWR(
    address ? `chains/${chainConfig.id}/vaults/${address}` : `chains/${chainConfig.id}/vaults`,
    () => getVaults(chainConfig),
    {
      suspense,
      revalidateOnFocus: false,
    },
  )
}
