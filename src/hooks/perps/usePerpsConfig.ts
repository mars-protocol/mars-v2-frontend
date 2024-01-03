import useSWR from 'swr'

import useChainConfig from 'hooks/useChainConfig'
import useClients from 'hooks/useClients'

export default function usePerpsConfig() {
  const chainConfig = useChainConfig()
  const clients = useClients()
  return useSWR(clients && `chains/${chainConfig.id}/perps/config`, () => getPerpsConfig(clients!))
}

async function getPerpsConfig(clients: ContractClients) {
  return clients.perps.config()
}
