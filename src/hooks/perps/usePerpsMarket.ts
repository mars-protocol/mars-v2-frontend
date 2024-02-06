import useSWR from 'swr'

import { BN_ZERO } from 'constants/math'
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
      long: BN_ZERO,
      short: BN_ZERO,
    },
  } as PerpsMarket
}
