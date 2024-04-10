import useSWR from 'swr'

import useChainConfig from 'hooks/useChainConfig'
import useClients from 'hooks/useClients'

export default function useManagedVaults() {
  const chainConfig = useChainConfig()
  const clients = useClients()

  return useSWR(clients && `chains/${chainConfig.id}/managed-vaults/`, async () => {
    if (!clients?.creditManager) return null
    return clients.creditManager.fundManagerVaults()
  })
}
