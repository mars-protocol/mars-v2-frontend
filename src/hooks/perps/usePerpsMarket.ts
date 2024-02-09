import useSWR from 'swr'

import usePerpsAsset from 'hooks/perps/usePerpsAsset'
import useChainConfig from 'hooks/useChainConfig'
import useClients from 'hooks/useClients'
import { BN } from 'utils/helpers'

export default function usePerpsMarket() {
  const chainConfig = useChainConfig()
  const { perpsAsset } = usePerpsAsset()
  const clients = useClients()

  return useSWR(
    clients && perpsAsset && `chains/${chainConfig.id}/perps/${perpsAsset.denom}`,
    () => getPerpsMarket(clients!, perpsAsset!),
    {
      refreshInterval: 5000,
      dedupingInterval: 5000,
    },
  )
}

async function getPerpsMarket(clients: ContractClients, asset: Asset) {
  const denomState = await clients.perps.perpDenomState({ denom: asset.denom })
  return {
    fundingRate: BN(denomState.rate as any),
    asset: asset,
    openInterest: {
      long: BN(denomState.long_oi),
      short: BN(denomState.short_oi),
    },
  } as PerpsMarket
}
