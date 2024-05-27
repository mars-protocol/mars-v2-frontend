import useAssetsNoOraclePrices from 'hooks/assets/useAssetsNoOraclePrices'
import { byDenom, bySymbol } from 'utils/array'

export default function useAsset(denomOrSymbol: string) {
  const { data: assets } = useAssetsNoOraclePrices()

  return assets.find(byDenom(denomOrSymbol)) ?? assets.find(bySymbol(denomOrSymbol))
}
