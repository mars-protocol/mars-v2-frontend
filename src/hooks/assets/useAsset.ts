import useAssetsWithoutPrices from 'hooks/assets/useAssetsWithoutPrices'
import { byDenom, bySymbol } from 'utils/array'

export default function useAsset(denomOrSymbol: string) {
  const { data: assets } = useAssetsWithoutPrices()

  return assets.find(byDenom(denomOrSymbol)) ?? assets.find(bySymbol(denomOrSymbol))
}
