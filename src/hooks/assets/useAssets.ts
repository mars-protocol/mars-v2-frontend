import getPrices from 'api/prices/getPrices'
import useChainConfig from 'hooks/chain/useChainConfig'
import useSWR from 'swr'
import { BNCoin } from 'types/classes/BNCoin'
import useAssetsNoOraclePrices from 'hooks/assets/useAssetsNoOraclePrices'

export default function useAssets() {
  const chainConfig = useChainConfig()
  const { data: assets } = useAssetsNoOraclePrices()

  return useSWR(
    assets && `chains/${chainConfig.id}/assets`,
    async () => mapPricesToAllAssets(assets!),
    {
      suspense: true,
      revalidateOnFocus: false,
      staleTime: 30_000,
      revalidateIfStale: true,
    },
  )

  async function mapPricesToAllAssets(assets: Asset[]) {
    const prices = await getPrices(chainConfig, assets)
    return assets.map((asset) => {
      return {
        ...asset,
        price:
          asset.denom === 'usd'
            ? BNCoin.fromCoin({ denom: 'usd', amount: '1' })
            : prices.find((price) => price.denom === asset.denom) ?? asset.price,
      }
    })
  }
}
