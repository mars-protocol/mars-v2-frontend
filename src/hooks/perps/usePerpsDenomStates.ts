import useSWR from 'swr'

import { useAllPerpsParams } from 'hooks/perps/usePerpsParams'
import useChainConfig from 'hooks/chain/useChainConfig'
import useClients from 'hooks/chain/useClients'

export default function useAllPerpsDenomStates() {
  const chainConfig = useChainConfig()
  const clients = useClients()
  const perpsParams = useAllPerpsParams()

  return useSWR(
    clients && perpsParams && `chains/${chainConfig.id}/perps/state`,
    () => {
      const promises = perpsParams!.map((perp) =>
        clients!.perps.perpDenomState({ denom: perp.denom }),
      )

      return Promise.all(promises)
    },
    {
      refreshInterval: 30000,
      dedupingInterval: 30000,
    },
  )
}
