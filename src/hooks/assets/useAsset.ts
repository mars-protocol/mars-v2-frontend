import useAllAssets from 'hooks/assets/useAllAssets'
import { byDenom, bySymbol } from 'utils/array'

export default function useAsset(denomOrSymbol: string) {
  const { data: assets } = useAllAssets()

  return assets.find(byDenom(denomOrSymbol)) ?? assets.find(bySymbol(denomOrSymbol))
}
