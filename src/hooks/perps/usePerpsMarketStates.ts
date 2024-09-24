import useSWR from 'swr'

import { PERPS_DEFAULT_ACTION } from 'constants/perps'
import useChainConfig from 'hooks/chain/useChainConfig'
import useClients from 'hooks/chain/useClients'
import { useAllPerpsParams } from 'hooks/perps/usePerpsParams'

export default function useAllPerpsMarketStates() {
  const chainConfig = useChainConfig()
  const clients = useClients()
  const perpsParams = useAllPerpsParams()

  return useSWR(
    clients && perpsParams && `chains/${chainConfig.id}/perps/state`,
    () => {
      const promises = perpsParams!.map((perp) =>
        clients!.perps.marketState({ ...PERPS_DEFAULT_ACTION, denom: perp.denom }),
      )

      return Promise.all(promises)
    },
    {
      revalidateOnFocus: false,
      refreshInterval: 30_000,
    },
  )
}
