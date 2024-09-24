import useSWR from 'swr'

import { PERPS_DEFAULT_ACTION } from 'constants/perps'
import useChainConfig from 'hooks/chain/useChainConfig'
import useClients from 'hooks/chain/useClients'

export default function usePerpsVaultState() {
  const chainConfig = useChainConfig()
  const clients = useClients()
  return useSWR(clients && `chains/${chainConfig.id}/perps/vault-state`, () =>
    getPerpsVaultState(clients!),
  )
}

async function getPerpsVaultState(clients: ContractClients) {
  return clients.perps.vault(PERPS_DEFAULT_ACTION)
}
