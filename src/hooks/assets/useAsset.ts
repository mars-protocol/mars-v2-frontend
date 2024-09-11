import { byDenom, bySymbol } from '../../utils/array'
import useAssets from './useAssets'

export default function useAsset(denomOrSymbol: string) {
  const { data: assets } = useAssets()

  return assets.find(byDenom(denomOrSymbol)) ?? assets.find(bySymbol(denomOrSymbol))
}
