import useAssets from 'hooks/assets/useAssets'
import { byDenom, bySymbol } from 'utils/array'

export default function useAsset(denomOrSymbol: string) {
  const { data: assets } = useAssets()

  return assets.find(byDenom(denomOrSymbol)) ?? assets.find(bySymbol(denomOrSymbol))
}
