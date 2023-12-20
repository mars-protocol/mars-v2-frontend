import useSWR from 'swr'

import { getVaultConfigs } from 'api/vaults/getVaultConfigs'
import useChainConfig from 'hooks/useChainConfig'

export default function useVaultConfigs() {
  const chainConfig = useChainConfig()
  return useSWR('vaultConfigs', () => getVaultConfigs(chainConfig), {
    fallbackData: [],
    revalidateOnFocus: false,
  })
}
