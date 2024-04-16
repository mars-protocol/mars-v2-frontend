import useSWR from 'swr'

import useChainConfig from 'hooks/useChainConfig'
import useClients from 'hooks/useClients'

export default function usePerpsVaultState() {
  const chainConfig = useChainConfig()
  const clients = useClients()
  return useSWR(clients && `chains/${chainConfig.id}/perps/vault-state`, () =>
    getPerpsVaultState(clients!),
  )
}

async function getPerpsVaultState(clients: ContractClients) {
  return clients.perps.vaultState()
}
