import useSWR from 'swr'

import { getVaultConfigs } from 'api/vaults/getVaultConfigs'

export default function useVaultConfigs() {
  return useSWR('vaultConfigs', getVaultConfigs, {
    fallbackData: [],
    revalidateOnFocus: false,
  })
}
