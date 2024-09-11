import useSWR from 'swr'

import useChainConfig from 'hooks/chain/useChainConfig'
import useClients from 'hooks/chain/useClients'
import usePerpsAsset from 'hooks/perps/usePerpsAsset'

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
