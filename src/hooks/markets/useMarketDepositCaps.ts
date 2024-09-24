import useSWR from 'swr'

import useWhitelistedAssets from 'hooks/assets/useWhitelistedAssets'
import useChainConfig from 'hooks/chain/useChainConfig'
import useClients from 'hooks/chain/useClients'

export default function useMarketDepositCaps() {
  const chainConfig = useChainConfig()
  const clients = useClients()
  const assets = useWhitelistedAssets()

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
