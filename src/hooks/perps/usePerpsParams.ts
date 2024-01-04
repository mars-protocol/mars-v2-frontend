import useSWR from 'swr'

import useChainConfig from 'hooks/useChainConfig'
import useClients from 'hooks/useClients'
import iterateContractQuery from 'utils/iterateContractQuery'

export default function usePerpsParams() {
  const chainConfig = useChainConfig()
  const clients = useClients()
  return useSWR(clients && `chains/${chainConfig.id}/perps/params`, () => getPerpsParams(clients!))
}

async function getPerpsParams(clients: ContractClients) {
  return iterateContractQuery(clients.params.allPerpParams, undefined, [])
}
