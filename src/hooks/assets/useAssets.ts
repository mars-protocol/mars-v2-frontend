import getPrices from 'api/prices/getPrices'
import useAssetsWithoutPrices from 'hooks/assets/useAssetsWithoutPrices'
import useChainConfig from 'hooks/chain/useChainConfig'
import useSWR from 'swr'
import { BNCoin } from 'types/classes/BNCoin'

export default function useAssets() {
  const chainConfig = useChainConfig()
  const { data: assets } = useAssetsWithoutPrices()

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

  /*   const [assets, setAssets] = useState<Asset[]>(allAssets)
  const [favoriteAssetsDenoms] = useFavoriteAssets()
  const getFavoriteAssets = useCallback(() => {
    const assets = allAssets
      .map((asset) => ({
        ...asset,
        isFavorite: favoriteAssetsDenoms.includes(asset.denom),
      }))
      .sort((a, b) => +b.isFavorite - +a.isFavorite)

    setAssets(assets)
  }, [favoriteAssetsDenoms, allAssets])

  useEffect(() => {
    getFavoriteAssets()
    window.addEventListener('storage', getFavoriteAssets)

    return () => {
      window.removeEventListener('storage', getFavoriteAssets)
    }
  }, [getFavoriteAssets]) */
}
