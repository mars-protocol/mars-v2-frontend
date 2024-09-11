import useSWR from 'swr'

import useChainConfig from 'chain/useChainConfig'
import useClients from 'chain/useClients'

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
