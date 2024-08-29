import useSWR from 'swr'

import useChainConfig from 'hooks/chain/useChainConfig'
import useClients from 'hooks/chain/useClients'
import { useAllPerpsParams } from 'hooks/perps/usePerpsParams'

export default function useAllPerpsDenomStates() {
  const chainConfig = useChainConfig()
  const clients = useClients()
  const perpsParams = useAllPerpsParams()

  return useSWR(
    clients && perpsParams && `chains/${chainConfig.id}/perps/state`,
    () => {
      const promises = perpsParams!.map((perp) =>
        clients!.perps.perpDenomState({ action: 'default', denom: perp.denom }),
      )

      return Promise.all(promises)
    },
    {
      refreshInterval: 30_000,
      dedupingInterval: 30_000,
    },
  )
}
