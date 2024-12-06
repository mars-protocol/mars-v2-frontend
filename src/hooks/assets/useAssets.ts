import getPrices from 'api/prices/getPrices'
import useAssetsNoOraclePrices from 'hooks/assets/useAssetsNoOraclePrices'
import useChainConfig from 'hooks/chain/useChainConfig'
import useSWR from 'swr'
import { BNCoin } from 'types/classes/BNCoin'

export default function useAssets() {
  const chainConfig = useChainConfig()
  const { data: assets } = useAssetsNoOraclePrices()
  return useSWR(
    assets && `chains/${chainConfig.id}/assets`,
    async () => mapPricesToAllAssets(assets!, chainConfig),
    {
      suspense: true,
      revalidateOnFocus: true,
      refreshInterval: 5_000,
    },
  )
}

async function mapPricesToAllAssets(assets: Asset[], chainConfig: ChainConfig) {
  const prices = await getPrices(chainConfig, assets)
  return assets.map((asset) => {
    return {
      ...asset,
      price:
        asset.denom === 'usd'
          ? BNCoin.fromCoin({ denom: 'usd', amount: '1' })
          : (prices.find((price) => price.denom === asset.denom) ?? asset.price),
    }
  })
}
