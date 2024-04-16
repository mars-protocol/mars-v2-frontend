import useSWR from 'swr'

import usePerpsAsset from 'hooks/perps/usePerpsAsset'
import useChainConfig from 'hooks/useChainConfig'
import useClients from 'hooks/useClients'

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
