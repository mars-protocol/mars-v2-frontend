import useSWR from 'swr'

import { PERPS_DEFAULT_ACTION } from 'constants/perps'
import useChainConfig from 'hooks/chain/useChainConfig'
import useClients from 'hooks/chain/useClients'
import usePerpsAsset from 'hooks/perps/usePerpsAsset'

export default function usePerpsMarketState() {
  const chainConfig = useChainConfig()
  const { perpsAsset } = usePerpsAsset()
  const clients = useClients()

  return useSWR(
    clients && perpsAsset && `chains/${chainConfig.id}/perps/${perpsAsset.denom}/state`,
    () => clients!.perps.marketState({ ...PERPS_DEFAULT_ACTION, denom: perpsAsset.denom }),
    {
      revalidateOnFocus: true,
      refreshInterval: 10_000,
    },
  )
}
