import useSWR from 'swr'

import useChainConfig from 'hooks/useChainConfig'
import useClients from 'hooks/useClients'
import { BN } from 'utils/helpers'

export default function usePerpsConfig() {
  const chainConfig = useChainConfig()
  const clients = useClients()
  return useSWR(clients && `chains/${chainConfig.id}/perps/config`, () => getPerpsConfig(clients!))
}

async function getPerpsConfig(clients: ContractClients) {
  const config = await clients.perps.config()

  return {
    closingFee: BN(config.closing_fee_rate),
  } as PerpsConfig
}

export interface PerpsConfig {
  closingFee: BigNumber
}
