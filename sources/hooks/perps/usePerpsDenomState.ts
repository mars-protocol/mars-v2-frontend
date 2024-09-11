import useSWR from 'swr'

import useChainConfig from '../chain/useChainConfig'
import useClients from '../chain/useClients'
import usePerpsAsset from './usePerpsAsset'

export default function usePerpsDenomState() {
  const chainConfig = useChainConfig()
  const { perpsAsset } = usePerpsAsset()
  const clients = useClients()

  return useSWR(
    clients && perpsAsset && `chains/${chainConfig.id}/perps/${perpsAsset.denom}/state`,
    () => clients!.perps.perpDenomState({ denom: perpsAsset.denom }),
    {
      refreshInterval: 30000,
      dedupingInterval: 30000,
    },
  )
}
