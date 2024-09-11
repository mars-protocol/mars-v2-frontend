import useSWR from 'swr'

import useAssets from 'hooks/assets/useAssets'
import useChainConfig from 'hooks/chain/useChainConfig'
import useClients from 'hooks/chain/useClients'
import useAssetParams from 'hooks/params/useAssetParams'
import { useMemo } from 'react'
import { byDenom } from 'utils/array'

export default function useMarketDepositCaps() {
  const chainConfig = useChainConfig()
  const clients = useClients()
  const { data: assetParams } = useAssetParams()
  const { data: allAssets } = useAssets()
  const assets = useMemo(() => {
    const assetsWithParams = [] as Asset[]

    if (!allAssets || !assetParams) return assetsWithParams

    assetParams.forEach((params) => {
      const asset = allAssets.find(byDenom(params.denom))
      if (!asset) return
      assetsWithParams.push(asset)
    })

    return assetsWithParams
  }, [allAssets, assetParams])

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
