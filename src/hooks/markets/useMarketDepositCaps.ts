import useSWR from 'swr'

import useMarketEnabledAssets from 'hooks/assets/useMarketEnabledAssets'
import useChainConfig from 'hooks/useChainConfig'
import useClients from 'hooks/useClients'

export default function useMarketDepositCaps() {
  const chainConfig = useChainConfig()
  const clients = useClients()
  const assets = useMarketEnabledAssets()

  return useSWR(
    assets.length > 0 && clients && `chains/${chainConfig.id}/markets/depositCap`,
    () => getMarketsDepositCap(clients!, assets),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
    },
  )
}

async function getMarketsDepositCap(clients: ContractClients, assets: Asset[]) {
  const capQueries = assets.map((asset) => clients.params.totalDeposit({ denom: asset.denom }))
  return Promise.all(capQueries)
}
