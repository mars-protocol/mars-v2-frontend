import useSWR from 'swr'

import useChainConfig from '../chain/useChainConfig'
import useClients from '../chain/useClients'
import { useAllPerpsParams } from './usePerpsParams'

export default function useAllPerpsDenomStates() {
  const chainConfig = useChainConfig()
  const clients = useClients()
  const perpsParams = useAllPerpsParams()

  return useSWR(
    clients && perpsParams && `chains/${chainConfig.id}/perps/state`,
    () => {
      /* PERPS
      const promises = perpsParams!.map((perp) =>
        clients!.perps.perpDenomState({ denom: perp.denom }),
      )

      return Promise.all(promises)
      */
      return []
    },
    {
      refreshInterval: 30_000,
      dedupingInterval: 30_000,
    },
  )
}
