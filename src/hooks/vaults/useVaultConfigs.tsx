import useSWRImmutable from 'swr/immutable'

import { getVaultConfigs } from 'api/vaults/getVaultConfigs'
import useChainConfig from 'chain/useChainConfig'

export default function useVaultConfigs() {
  const chainConfig = useChainConfig()
  return useSWRImmutable(
    `chains/${chainConfig.id}/vaultConfigs`,
    () => getVaultConfigs(chainConfig),
    {
      suspense: true,
      revalidateOnFocus: false,
    },
  )
}
