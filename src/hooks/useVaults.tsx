import useSWR from 'swr'

import getVaults from 'api/vaults/getVaults'
import useChainConfig from 'hooks/useChainConfig'

export default function useVaults(suspense: boolean = true, address?: string) {
  const chainConfig = useChainConfig()

  return useSWR(
    address && `chains/${chainConfig.id}/vaults/${address}`,
    () => getVaults(chainConfig),
    {
      suspense,
      revalidateOnFocus: false,
    },
  )
}
